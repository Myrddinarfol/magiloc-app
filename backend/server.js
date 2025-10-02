import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool, { initDb } from "./database/db.js";

dotenv.config();
console.log("DEBUG DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 5000;

// Init DB
initDb();

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
        motif_maintenance as "motifMaintenance"
      FROM equipments
      ORDER BY id
    `);
    res.json(result.rows);
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

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const eq of equipments) {
        await client.query(
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
      
      await client.query('COMMIT');
      console.log(`✅ ${equipments.length} équipements importés`);
      
      res.json({ 
        success: true, 
        message: `✅ ${equipments.length} équipements importés avec succès` 
      });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error("❌ Erreur import:", err.message);
    res.status(500).json({ error: "Erreur lors de l'import", details: err.message });
  }
});

// Route pour ajouter un équipement
app.post("/api/equipment", async (req, res) => {
  try {
    const { designation, numero_serie } = req.body;

    const result = await pool.query(
      "INSERT INTO equipments (designation, numero_serie) VALUES ($1, $2) RETURNING *",
      [designation, numero_serie]
    );

    res.json({ message: "✅ Équipement ajouté", equipment: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur insertion:", err.message);
    res.status(500).json({ error: "Erreur lors de l'ajout" });
  }
});

// Route pour mettre à jour un équipement (PATCH)
app.patch("/api/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { certificat, statut, client, debutLocation, finLocationTheorique, numeroOffre, notesLocation } = req.body;

    console.log(`📝 Mise à jour équipement ${id}:`, req.body);

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
    if (client !== undefined) {
      updateFields.push(`client = $${paramIndex++}`);
      values.push(client);
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

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);
    const query = `UPDATE equipments SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    res.json({
      message: "✅ Équipement mis à jour",
      equipment: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Erreur mise à jour:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// Route pour effectuer le retour d'un équipement (Location -> Maintenance)
app.post("/api/equipment/:id/return", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { rentreeLe, noteRetour } = req.body;

    console.log(`🔄 Retour équipement ${id}:`, { rentreeLe, noteRetour });

    await client.query('BEGIN');

    // 1. Récupérer les infos actuelles de l'équipement
    const equipmentResult = await client.query(
      'SELECT * FROM equipments WHERE id = $1',
      [id]
    );

    if (equipmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    const equipment = equipmentResult.rows[0];

    // 2. Archiver dans location_history
    await client.query(
      `INSERT INTO location_history (
        equipment_id, client, date_debut, date_fin, date_retour_reel,
        numero_offre, notes_location, note_retour, rentre_le
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        equipment.client,
        equipment.debut_location,
        equipment.fin_location_theorique,
        rentreeLe,
        equipment.numero_offre,
        equipment.notes_location,
        noteRetour,
        rentreeLe
      ]
    );

    // 3. Créer entrée dans maintenance_history
    await client.query(
      `INSERT INTO maintenance_history (
        equipment_id, motif_maintenance, note_retour, date_entree
      ) VALUES ($1, $2, $3, NOW())`,
      [id, 'Retour Location, à vérifier', noteRetour]
    );

    // 4. Mettre à jour l'équipement
    await client.query(
      `UPDATE equipments SET
        statut = 'En Maintenance',
        motif_maintenance = 'Retour Location, à vérifier',
        note_retour = $1,
        rentre_le = $2
      WHERE id = $3`,
      [noteRetour, rentreeLe, id]
    );

    await client.query('COMMIT');

    console.log(`✅ Retour effectué pour équipement ${id}`);

    res.json({
      message: "✅ Retour effectué avec succès",
      equipment_id: id
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Erreur retour:", err.message);
    res.status(500).json({ error: "Erreur lors du retour", details: err.message });
  } finally {
    client.release();
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});