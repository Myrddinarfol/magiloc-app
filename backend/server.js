import express from "express";
import cors from "cors";
import pool from "./database/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Note: initDb() n'est plus appelé automatiquement
// Utiliser "npm run reset-db" pour réinitialiser une base locale

// Middleware CORS configuré
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://magiloc-backend.onrender.com',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Fonction pour convertir date française DD/MM/YYYY vers ISO YYYY-MM-DD
function convertFrenchDateToISO(dateStr) {
  if (!dateStr) return null;

  // Si c'est déjà au format ISO complet (YYYY-MM-DDTHH:MM:SS), extraire la date
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  // Si c'est déjà au format ISO date simple (YYYY-MM-DD), retourner tel quel
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Si c'est au format français DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  // Essayer de parser comme date JavaScript
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Erreur conversion date:', dateStr, e.message);
  }

  return dateStr;
}

// Fonction pour convertir date ISO vers format français DD/MM/YYYY
function formatDateToFrench(dateStr) {
  if (!dateStr) return null;

  // Si déjà au format français
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Convertir depuis ISO ou Date object
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Fonction pour calculer les jours ouvrés (lundi-vendredi, hors jours fériés français)
function calculateBusinessDays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) return null;

  // Jours fériés français 2025-2026
  const holidays = [
    '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09',
    '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
    '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25',
    '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25'
  ];

  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // Compter seulement si c'est un jour de semaine (1-5) et pas un jour férié
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

// Routes de base
app.get("/", (req, res) => {
  res.json({ message: "MagiLoc API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Route pour récupérer tous les équipements
app.get("/api/equipment", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        designation,
        cmu,
        modele,
        marque,
        longueur,
        infos_complementaires as "infosComplementaires",
        numero_serie as "numeroSerie",
        prix_ht_jour as "prixHT",
        etat,
        certificat,
        dernier_vgp as "dernierVGP",
        prochain_vgp as "prochainVGP",
        statut,
        client,
        debut_location as "debutLocation",
        fin_location_theorique as "finLocationTheorique",
        rentre_le as "rentreeLe",
        numero_offre as "numeroOffre",
        notes_location as "notesLocation",
        motif_maintenance as "motifMaintenance",
        note_retour as "noteRetour"
      FROM equipments
      ORDER BY id
    `);

    // Formater toutes les dates au format français
    const equipmentsWithFrenchDates = result.rows.map(eq => ({
      ...eq,
      dernierVGP: formatDateToFrench(eq.dernierVGP),
      prochainVGP: formatDateToFrench(eq.prochainVGP),
      debutLocation: formatDateToFrench(eq.debutLocation),
      finLocationTheorique: formatDateToFrench(eq.finLocationTheorique),
      rentreeLe: formatDateToFrench(eq.rentreeLe)
    }));

    res.json(equipmentsWithFrenchDates);
  } catch (err) {
    console.error("❌ Erreur DB:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// Route pour importer plusieurs équipements
app.post("/api/equipment/import", async (req, res) => {
  try {
    const equipments = req.body;
    console.log(`📥 Import de ${equipments.length} équipements`);

    const dbClient = await pool.connect();

    try {
      await dbClient.query('BEGIN');
      
      for (const eq of equipments) {
        await dbClient.query(
          `INSERT INTO equipments (
            designation, cmu, modele, marque, longueur,
            infos_complementaires, numero_serie, prix_ht_jour, etat,
            certificat, dernier_vgp, prochain_vgp, statut,
            client, debut_location, fin_location_theorique, rentre_le, numero_offre, notes_location, motif_maintenance
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (numero_serie) DO UPDATE SET
            designation = EXCLUDED.designation,
            cmu = EXCLUDED.cmu,
            modele = EXCLUDED.modele,
            statut = EXCLUDED.statut,
            client = EXCLUDED.client,
            debut_location = EXCLUDED.debut_location,
            fin_location_theorique = EXCLUDED.fin_location_theorique,
            rentre_le = EXCLUDED.rentre_le,
            numero_offre = EXCLUDED.numero_offre,
            notes_location = EXCLUDED.notes_location,
            motif_maintenance = EXCLUDED.motif_maintenance`,
          [
            eq.designation,
            eq.cmu,
            eq.modele,
            eq.marque,
            eq.longueur,
            eq.infosComplementaires,
            eq.numeroSerie,
            eq.prixHT,
            eq.etat,
            eq.certificat,
            eq.dernierVGP,
            eq.prochainVGP,
            eq.statut || 'Sur Parc',
            eq.client,
            eq.debutLocation,
            eq.finLocationTheorique,
            eq.rentreeLe,
            eq.numeroOffre,
            eq.notesLocation,
            eq.motifMaintenance
          ]
        );
      }

      await dbClient.query('COMMIT');
      console.log(`✅ ${equipments.length} équipements importés`);
      
      res.json({ 
        success: true, 
        message: `✅ ${equipments.length} équipements importés avec succès` 
      });
      
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
    
  } catch (err) {
    console.error("❌ Erreur import:", err.message);
    res.status(500).json({ error: "Erreur lors de l'import", details: err.message });
  }
});

// Route pour ajouter un équipement
app.post("/api/equipment", async (req, res) => {
  try {
    const {
      designation, cmu, modele, marque, longueur, numeroSerie, prixHT, etat,
      prochainVGP, certificat, statut
    } = req.body;

    console.log("➕ Ajout nouvel équipement:", req.body);

    const result = await pool.query(
      `INSERT INTO equipments (
        designation, cmu, modele, marque, longueur, numero_serie,
        prix_ht_jour, etat, prochain_vgp, certificat, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        designation, cmu, modele, marque, longueur, numeroSerie,
        prixHT, etat, prochainVGP, certificat, statut || 'Sur Parc'
      ]
    );

    console.log("✅ Équipement ajouté:", result.rows[0]);
    res.json({ message: "✅ Équipement ajouté", equipment: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur insertion:", err.message);
    res.status(500).json({ error: "Erreur lors de l'ajout" });
  }
});

// Route pour mettre à jour un équipement (PATCH)
app.patch("/api/equipment/:id", async (req, res) => {
  const dbClient = await pool.connect();

  try {
    console.log(`📝 DÉBUT Mise à jour équipement ${req.params.id}`);
    await dbClient.query('BEGIN');

    const { id } = req.params;
    const {
      certificat, statut, client: clientName, debutLocation, finLocationTheorique, numeroOffre, notesLocation,
      modele, marque, longueur, numeroSerie, prixHT, etat, motifMaintenance, debutMaintenance
    } = req.body;

    console.log(`📝 Body reçu:`, { statut, clientName, motifMaintenance, debutMaintenance });

    // Récupérer l'état actuel de l'équipement
    console.log(`🔍 Récupération équipement ${id}...`);
    const currentEquipment = await dbClient.query(
      `SELECT * FROM equipments WHERE id = $1`,
      [id]
    );

    if (currentEquipment.rows.length === 0) {
      console.log(`❌ Équipement ${id} non trouvé`);
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    console.log(`✅ Équipement trouvé, statut actuel: ${currentEquipment.rows[0].statut}`);

    const equipmentBefore = currentEquipment.rows[0];

    // Détecter si on valide la maintenance (passage de "En Maintenance" à "Sur Parc")
    const isCompletingMaintenance =
      equipmentBefore.statut === 'En Maintenance' && statut === 'Sur Parc';

    // Construction dynamique de la requête SQL
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (certificat !== undefined) {
      updateFields.push(`certificat = $${paramIndex++}`);
      values.push(certificat);
    }
    if (statut !== undefined) {
      updateFields.push(`statut = $${paramIndex++}`);
      values.push(statut);
    }
    if (clientName !== undefined) {
      updateFields.push(`client = $${paramIndex++}`);
      values.push(clientName);
    }
    if (debutLocation !== undefined) {
      updateFields.push(`debut_location = $${paramIndex++}`);
      values.push(debutLocation);
    }
    if (finLocationTheorique !== undefined) {
      updateFields.push(`fin_location_theorique = $${paramIndex++}`);
      values.push(finLocationTheorique);
    }
    if (numeroOffre !== undefined) {
      updateFields.push(`numero_offre = $${paramIndex++}`);
      values.push(numeroOffre);
    }
    if (notesLocation !== undefined) {
      updateFields.push(`notes_location = $${paramIndex++}`);
      values.push(notesLocation);
    }
    if (motifMaintenance !== undefined) {
      updateFields.push(`motif_maintenance = $${paramIndex++}`);
      values.push(motifMaintenance);
    }
    if (debutMaintenance !== undefined) {
      updateFields.push(`debut_maintenance = $${paramIndex++}`);
      values.push(debutMaintenance);
    }
    // Nouveaux champs pour les informations techniques
    if (modele !== undefined) {
      updateFields.push(`modele = $${paramIndex++}`);
      values.push(modele);
    }
    if (marque !== undefined) {
      updateFields.push(`marque = $${paramIndex++}`);
      values.push(marque);
    }
    if (longueur !== undefined) {
      updateFields.push(`longueur = $${paramIndex++}`);
      values.push(longueur);
    }
    if (numeroSerie !== undefined) {
      updateFields.push(`numero_serie = $${paramIndex++}`);
      values.push(numeroSerie);
    }
    if (prixHT !== undefined) {
      updateFields.push(`prix_ht_jour = $${paramIndex++}`);
      values.push(prixHT);
    }
    if (etat !== undefined) {
      updateFields.push(`etat = $${paramIndex++}`);
      values.push(etat);
    }

    if (updateFields.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);
    const query = `UPDATE equipments SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    console.log(`🔄 Exécution UPDATE...`);
    const result = await dbClient.query(query, values);
    console.log(`✅ UPDATE réussi`);

    // Si on valide la maintenance, enregistrer dans l'historique
    if (isCompletingMaintenance) {
      console.log(`🔍 Validation maintenance - debut_maintenance: ${equipmentBefore.debut_maintenance}`);

      if (equipmentBefore.debut_maintenance) {
        try {
          // Convertir la date de début (peut être en format français ou ISO)
          const debutMaintenanceISO = convertFrenchDateToISO(equipmentBefore.debut_maintenance);
          console.log(`📅 Date convertie: ${equipmentBefore.debut_maintenance} → ${debutMaintenanceISO}`);

          const dateEntree = new Date(debutMaintenanceISO);
          const dateSortie = new Date();

          // Vérifier que la date est valide
          if (isNaN(dateEntree.getTime())) {
            console.error(`❌ Date invalide: ${equipmentBefore.debut_maintenance}`);
            throw new Error('Date de début maintenance invalide');
          }

          const dureeJours = Math.ceil((dateSortie - dateEntree) / (1000 * 60 * 60 * 24));

          console.log(`📊 Maintenance terminée - Durée: ${dureeJours} jours (${debutMaintenanceISO} -> ${dateSortie.toISOString().split('T')[0]})`);

          await dbClient.query(
            `INSERT INTO maintenance_history (
              equipment_id, motif, note_retour, date_entree, date_sortie, duree_jours
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id,
              equipmentBefore.motif_maintenance || 'Maintenance générale',
              equipmentBefore.note_retour || null,
              debutMaintenanceISO,
              dateSortie.toISOString().split('T')[0],
              dureeJours
            ]
          );

          console.log(`✅ Historique maintenance créé pour équipement ${id}`);
        } catch (err) {
          console.error(`❌ Erreur historique maintenance:`, err.message, err.stack);
          // Continue quand même pour remettre le matériel sur parc
        }
      } else {
        console.log(`⚠️ Pas de date de début - pas d'historique créé`);
      }

      // Réinitialiser les champs de maintenance dans tous les cas
      console.log(`🧹 Reset champs maintenance...`);
      await dbClient.query(
        `UPDATE equipments SET motif_maintenance = NULL, debut_maintenance = NULL, note_retour = NULL WHERE id = $1`,
        [id]
      );
      console.log(`✅ Champs maintenance réinitialisés`);
    }

    console.log(`✅ COMMIT transaction...`);
    await dbClient.query('COMMIT');

    res.json({
      message: "✅ Équipement mis à jour",
      equipment: result.rows[0]
    });
  } catch (err) {
    console.error("❌ ERREUR CATCH:", err.message, err.stack);
    await dbClient.query('ROLLBACK');
    res.status(500).json({ error: "Erreur lors de la mise à jour", details: err.message });
  } finally {
    dbClient.release();
  }
});

// Route pour effectuer le retour d'un équipement (Location -> Maintenance)
app.post("/api/equipment/:id/return", async (req, res) => {
  const dbClient = await pool.connect();

  try {
    const { id } = req.params;
    const { rentreeLe, noteRetour } = req.body;

    console.log(`🔄 Retour équipement ${id}:`, { rentreeLe, noteRetour });

    await dbClient.query('BEGIN');

    // 1. Récupérer les infos actuelles de l'équipement
    const equipmentResult = await dbClient.query(
      'SELECT * FROM equipments WHERE id = $1',
      [id]
    );

    if (equipmentResult.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    const equipment = equipmentResult.rows[0];

    // Convertir les dates au format ISO
    const debutLocationISO = convertFrenchDateToISO(equipment.debut_location);
    const finLocationTheoriqueISO = convertFrenchDateToISO(equipment.fin_location_theorique);
    const rentreLeISO = convertFrenchDateToISO(rentreeLe);

    // 2. Calculer le CA de la location
    const businessDays = calculateBusinessDays(debutLocationISO, rentreLeISO);
    const prixHT = equipment.prix_ht_jour ? parseFloat(equipment.prix_ht_jour) : null;
    const isLongDuration = businessDays && businessDays >= 21;
    let caTotal = null;

    if (businessDays && prixHT) {
      if (isLongDuration) {
        // Remise 20% pour location longue durée
        caTotal = (businessDays * prixHT * 0.8).toFixed(2);
      } else {
        caTotal = (businessDays * prixHT).toFixed(2);
      }
    }

    console.log(`📊 CA calculé: ${caTotal}€ HT (${businessDays} jours × ${prixHT}€/j${isLongDuration ? ' - 20% LD' : ''})`);

    // 3. Archiver dans location_history avec le CA
    await dbClient.query(
      `INSERT INTO location_history (
        equipment_id, client, date_debut, date_fin, date_retour_reel,
        numero_offre, notes_location, note_retour, rentre_le,
        duree_jours_ouvres, prix_ht_jour, remise_ld, ca_total_ht
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        equipment.client,
        debutLocationISO,
        finLocationTheoriqueISO,
        rentreLeISO,
        equipment.numero_offre,
        equipment.notes_location,
        noteRetour,
        rentreLeISO,
        businessDays,
        prixHT,
        isLongDuration,
        caTotal
      ]
    );

    // NOTE: On ne crée PAS d'entrée dans maintenance_history ici
    // L'historique sera créé uniquement quand on VALIDE la maintenance (sortie)
    // Cela évite les doublons

    // 4. Mettre à jour l'équipement
    await dbClient.query(
      `UPDATE equipments SET
        statut = 'En Maintenance',
        motif_maintenance = 'Retour Location, à vérifier',
        note_retour = $1,
        rentre_le = $2,
        debut_maintenance = NOW()
      WHERE id = $3`,
      [noteRetour, rentreLeISO, id]
    );

    await dbClient.query('COMMIT');

    console.log(`✅ Retour effectué pour équipement ${id}`);

    res.json({
      message: "✅ Retour effectué avec succès",
      equipment_id: id
    });

  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error("❌ Erreur retour:", err.message);
    res.status(500).json({ error: "Erreur lors du retour", details: err.message });
  } finally {
    dbClient.release();
  }
});

// Route pour récupérer l'historique des locations d'un équipement
app.get("/api/equipment/:id/location-history", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM location_history
       WHERE equipment_id = $1
       ORDER BY date_debut DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur historique locations:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique" });
  }
});

// Route pour récupérer l'historique de maintenance d'un équipement
app.get("/api/equipment/:id/maintenance-history", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM maintenance_history
       WHERE equipment_id = $1
       ORDER BY date_entree DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur historique maintenance:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique" });
  }
});

// Route pour supprimer un équipement
app.delete("/api/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Suppression équipement ${id}`);

    const result = await pool.query(
      `DELETE FROM equipments WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    console.log(`✅ Équipement ${id} supprimé`);
    res.json({ message: "✅ Équipement supprimé", equipment: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur suppression:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});