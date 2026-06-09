import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./database/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { generateToken, verifyToken, logRequest } from './middleware/auth.js';
import {
  handleValidationErrors,
  equipmentValidation,
  clientValidation,
  paginationValidation
} from './middleware/validation.js';
import { convertFrenchDateToISO, formatDateToFrench, calculateBusinessDays } from './utils/dateHelpers.js';
import authRoutes from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════════════════════════════════════
// FONCTION POUR EXÉCUTER LES MIGRATIONS
// ═══════════════════════════════════════════════════════════════════════════
async function runPendingMigrations() {
  try {
    console.log('🔄 Vérification des migrations...');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`📝 Exécution migration: ${file}`);

      const commands = sql.split(';').filter(cmd => cmd.trim());

      for (const command of commands) {
        if (command.trim()) {
          try {
            await pool.query(command);
          } catch (err) {
            // Ignorer les erreurs "already exists" ou "does not exist" (en anglais et français)
            const ignorePatterns = ['already exists', 'does not exist', 'existe déjà', "n'existe pas"];
            const shouldIgnore = ignorePatterns.some(pattern => err.message.includes(pattern));
            if (!shouldIgnore) {
              console.error(`❌ Erreur migration ${file}:`, err.message);
              throw err;
            }
          }
        }
      }
    }

    console.log('✅ Migrations vérifiées');
  } catch (err) {
    console.error('❌ Erreur lors des migrations:', err.message);
    // Ne pas arrêter le serveur, continuer malgré l'erreur
  }
}

// Exécuter les migrations avant de démarrer le serveur
await runPendingMigrations();

// Note: initDb() n'est plus appelé automatiquement
// Utiliser "npm run reset-db" pour réinitialiser une base locale

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINT DIAGNOSTIC POUR VÉRIFIER LES COLONNES DE LA TABLE
// ═══════════════════════════════════════════════════════════════════════════
app.get("/api/diagnostic/columns", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_name = 'equipments' ORDER BY column_name`
    );
    console.log('📋 Colonnes de la table equipments:', result.rows.map(r => r.column_name));
    res.json({
      message: "Colonnes de la table equipments",
      columns: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ENDPOINT DIAGNOSTIC POUR VÉRIFIER LA TABLE FEEDBACKS
// ═══════════════════════════════════════════════════════════════════════════
app.get("/api/diagnostic/feedbacks", async (req, res) => {
  try {
    // Vérifier si la table feedbacks existe
    const tableExists = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'feedbacks')`
    );
    const feedbacksTableExists = tableExists.rows[0].exists;

    if (!feedbacksTableExists) {
      return res.status(400).json({
        error: "Table feedbacks n'existe pas",
        exists: false,
        message: "Veuillez vérifier que les migrations ont été exécutées"
      });
    }

    // Vérifier les colonnes de la table feedbacks
    const columns = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_name = 'feedbacks' ORDER BY ordinal_position`
    );

    // Compter les feedbacks
    const count = await pool.query(`SELECT COUNT(*) as total FROM feedbacks`);

    res.json({
      status: "OK",
      exists: true,
      columns: columns.rows,
      totalFeedbacks: count.rows[0].total,
      message: "Table feedbacks est correctement créée"
    });
  } catch (err) {
    console.error('❌ Erreur diagnostic feedbacks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Middleware CORS configuré
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5001',
    'https://magiloc-app-production.up.railway.app',
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

// Endpoint de diagnostic pour vérifier les colonnes de maintenance_history
app.get("/api/diagnostic/maintenance-columns", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_name = 'maintenance_history' ORDER BY column_name`
    );
    console.log('📋 Colonnes de maintenance_history:', result.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    res.json({
      message: "Colonnes de la table maintenance_history",
      columns: result.rows,
      hasDbDays: result.rows.some(r => r.column_name === 'duree_jours'),
      hasVgp: result.rows.some(r => r.column_name === 'vgp_effectuee')
    });
  } catch (err) {
    console.error('❌ Erreur diagnostic:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de diagnostic pour vérifier les données réelles de maintenance
app.get("/api/diagnostic/maintenance-data", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, equipment_id, date_entree, date_sortie, motif_maintenance,
              travaux_effectues, vgp_effectuee
       FROM public.maintenance_history
       ORDER BY id DESC
       LIMIT 5`
    );

    console.log('📊 Derniers enregistrements de maintenance:');
    result.rows.forEach((row, idx) => {
      console.log(`  [${idx}] ID: ${row.id}, Equipment: ${row.equipment_id}`);
      console.log(`      Travaux: ${row.travaux_effectues}`);
      console.log(`      VGP DB: ${row.vgp_effectuee}`);
    });

    res.json({
      message: "Derniers enregistrements de maintenance_history",
      records: result.rows
    });
  } catch (err) {
    console.error('❌ Erreur diagnostic:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTIFICATION JWT (Modular routes from routes/auth.js)
// ═══════════════════════════════════════════════════════════════════════════
app.use('/api/auth', authRoutes);

// Route pour récupérer tous les équipements (avec pagination optionnelle)
/**
 * GET /api/equipment?page=1&limit=50&search=designation
 *
 * Query params (tous optionnels):
 * - page: numéro de page (défaut: 1)
 * - limit: nombre d'équipements par page (défaut: 500 pour compatibilité)
 * - search: recherche simple sur la désignation
 *
 * Response:
 * - Si pagination: { data: [], page, limit, total, totalPages }
 * - Si pas pagination: []
 */
app.get("/api/equipment", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 500));
    const search = (req.query.search || '').trim();
    const usePagination = req.query.page !== undefined || req.query.limit !== undefined;

    const offset = (page - 1) * limit;

    // Construire la requête avec filtres optionnels
    let whereClause = '';
    const params = [];

    if (search) {
      whereClause = 'WHERE designation ILIKE $1';
      params.push(`%${search}%`);
    }

    // Requête principal
    const paramIndex = params.length + 1;
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
        minimum_facturation as "minimumFacturation",
        minimum_facturation_apply as "minimumFacturationApply",
        id_article as "idArticle",
        etat,
        certificat,
        dernier_vgp as "dernierVGP",
        prochain_vgp as "prochainVGP",
        statut,
        client,
        debut_location as "debutLocation",
        fin_location_theorique as "finLocationTheorique",
        depart_enlevement as "departEnlevement",
        rentre_le as "rentreeLe",
        numero_offre as "numeroOffre",
        notes_location as "notesLocation",
        motif_maintenance as "motifMaintenance",
        note_retour as "noteRetour",
        est_pret as "estPret",
        est_long_duree as "estLongDuree"
      FROM equipments
      ${whereClause}
      ORDER BY id
      ${usePagination ? `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}` : ''}
    `, usePagination ? [...params, limit, offset] : params);

    // Formater toutes les dates au format français
    const equipmentsWithFrenchDates = result.rows.map(eq => ({
      ...eq,
      dernierVGP: formatDateToFrench(eq.dernierVGP),
      prochainVGP: formatDateToFrench(eq.prochainVGP),
      debutLocation: formatDateToFrench(eq.debutLocation),
      finLocationTheorique: formatDateToFrench(eq.finLocationTheorique),
      departEnlevement: formatDateToFrench(eq.departEnlevement),
      rentreeLe: formatDateToFrench(eq.rentreeLe)
    }));

    // Si pagination: retourner object avec métadonnées
    if (usePagination) {
      // Requête COUNT pour le total
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM equipments ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return res.json({
        data: equipmentsWithFrenchDates,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    }

    // Sinon: retourner le array directement (compatibilité)
    res.json(equipmentsWithFrenchDates);
  } catch (err) {
    console.error("❌ Erreur DB:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// Route pour importer plusieurs équipements (optimisée avec UNNEST)
/**
 * POST /api/equipment/import
 *
 * Importe multiple équipements en une SEULE requête SQL (au lieu de N requêtes)
 *
 * Body: Array of equipment objects
 * Performance: 500 items en 2-3s (au lieu de 25-50s avant)
 */
app.post("/api/equipment/import", async (req, res) => {
  try {
    const equipments = req.body;
    if (!Array.isArray(equipments) || equipments.length === 0) {
      return res.status(400).json({ error: "Body must be an array of equipments" });
    }

    console.log(`📥 Import de ${equipments.length} équipements (batch mode)`);
    const startTime = Date.now();

    // Préparer les arrays pour UNNEST
    const designations = [];
    const cmus = [];
    const modeles = [];
    const marques = [];
    const longueurs = [];
    const infosComplementaires = [];
    const numeroSeries = [];
    const prixHTJours = [];
    const etats = [];
    const certificats = [];
    const dernierVGPs = [];
    const prochainVGPs = [];
    const statuts = [];
    const clients = [];
    const debutLocations = [];
    const finLocationTheorique = [];
    const rentreeLes = [];
    const numeroOffres = [];
    const notesLocations = [];
    const noteRetours = [];
    const motifMaintenances = [];

    // Remplir les arrays
    for (const eq of equipments) {
      designations.push(eq.designation || '');
      cmus.push(eq.cmu || '');
      modeles.push(eq.modele || null);
      marques.push(eq.marque || null);
      longueurs.push(eq.longueur || null);
      infosComplementaires.push(eq.infosComplementaires || null);
      numeroSeries.push(eq.numeroSerie || '');
      prixHTJours.push(eq.prixHT ? parseFloat(eq.prixHT) : null);
      etats.push(eq.etat || null);
      certificats.push(eq.certificat || null);
      dernierVGPs.push(eq.dernierVGP ? convertFrenchDateToISO(eq.dernierVGP) : null);
      prochainVGPs.push(eq.prochainVGP ? convertFrenchDateToISO(eq.prochainVGP) : null);
      statuts.push(eq.statut || 'Sur Parc');
      clients.push(eq.client || null);
      debutLocations.push(eq.debutLocation ? convertFrenchDateToISO(eq.debutLocation) : null);
      finLocationTheorique.push(eq.finLocationTheorique ? convertFrenchDateToISO(eq.finLocationTheorique) : null);
      rentreeLes.push(eq.rentreeLe ? convertFrenchDateToISO(eq.rentreeLe) : null);
      numeroOffres.push(eq.numeroOffre || null);
      notesLocations.push(eq.notesLocation || null);
      noteRetours.push(eq.noteRetour || null);
      motifMaintenances.push(eq.motifMaintenance || null);
    }

    // Une SEULE requête SQL avec UNNEST
    const result = await pool.query(`
      INSERT INTO equipments (
        designation, cmu, modele, marque, longueur,
        infos_complementaires, numero_serie, prix_ht_jour, etat,
        certificat, dernier_vgp, prochain_vgp, statut,
        client, debut_location, fin_location_theorique, rentre_le, numero_offre, notes_location, note_retour, motif_maintenance
      )
      SELECT * FROM UNNEST(
        $1::text[],      -- designations
        $2::text[],      -- cmus
        $3::text[],      -- modeles
        $4::text[],      -- marques
        $5::text[],      -- longueurs
        $6::text[],      -- infosComplementaires
        $7::text[],      -- numeroSeries
        $8::numeric[],   -- prixHTJours
        $9::text[],      -- etats
        $10::text[],     -- certificats
        $11::date[],     -- dernierVGPs
        $12::date[],     -- prochainVGPs
        $13::text[],     -- statuts
        $14::text[],     -- clients
        $15::date[],     -- debutLocations
        $16::date[],     -- finLocationTheorique
        $17::date[],     -- rentreeLes
        $18::text[],     -- numeroOffres
        $19::text[],     -- notesLocations
        $20::text[],     -- noteRetours
        $21::text[]      -- motifMaintenances
      ) AS t(
        designation, cmu, modele, marque, longueur,
        infos_complementaires, numero_serie, prix_ht_jour, etat,
        certificat, dernier_vgp, prochain_vgp, statut,
        client, debut_location, fin_location_theorique, rentre_le, numero_offre, notes_location, note_retour, motif_maintenance
      )
      ON CONFLICT (numero_serie) DO UPDATE SET
        designation = EXCLUDED.designation,
        cmu = EXCLUDED.cmu,
        modele = EXCLUDED.modele,
        marque = EXCLUDED.marque,
        longueur = EXCLUDED.longueur,
        infos_complementaires = EXCLUDED.infos_complementaires,
        prix_ht_jour = EXCLUDED.prix_ht_jour,
        etat = EXCLUDED.etat,
        certificat = EXCLUDED.certificat,
        dernier_vgp = EXCLUDED.dernier_vgp,
        prochain_vgp = EXCLUDED.prochain_vgp,
        statut = EXCLUDED.statut,
        client = EXCLUDED.client,
        debut_location = EXCLUDED.debut_location,
        fin_location_theorique = EXCLUDED.fin_location_theorique,
        rentre_le = EXCLUDED.rentre_le,
        numero_offre = EXCLUDED.numero_offre,
        notes_location = EXCLUDED.notes_location,
        note_retour = EXCLUDED.note_retour,
        motif_maintenance = EXCLUDED.motif_maintenance
      RETURNING id;
    `, [
      designations, cmus, modeles, marques, longueurs,
      infosComplementaires, numeroSeries, prixHTJours, etats,
      certificats, dernierVGPs, prochainVGPs, statuts,
      clients, debutLocations, finLocationTheorique, rentreeLes, numeroOffres, notesLocations, noteRetours, motifMaintenances
    ]);

    const duration = Date.now() - startTime;
    console.log(`✅ ${result.rowCount} équipements importés en ${duration}ms (optimisé UNNEST)`);

    res.json({
      success: true,
      message: `✅ ${result.rowCount} équipements importés avec succès`,
      duration: `${duration}ms`,
      itemsPerSecond: Math.round(equipments.length / (duration / 1000))
    });

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
      dernierVGP, prochainVGP, certificat, infosComplementaires, statut
    } = req.body;

    console.log("➕ Ajout nouvel équipement:", req.body);

    // Convertir les chaînes vides en null pour les champs numériques/dates
    const prixHTValue = prixHT && prixHT !== '' ? parseFloat(prixHT) : null;
    const dernierVGPValue = dernierVGP && dernierVGP !== '' ? dernierVGP : null;

    // Convertir prochainVGP du format français (DD/MM/YYYY) vers ISO (YYYY-MM-DD)
    let prochainVGPISO = null;
    if (prochainVGP && prochainVGP !== '') {
      prochainVGPISO = convertFrenchDateToISO(prochainVGP);
      console.log(`🔄 Conversion date: "${prochainVGP}" => "${prochainVGPISO}"`);
    }

    const result = await pool.query(
      `INSERT INTO equipments (
        designation, cmu, modele, marque, longueur, numero_serie,
        prix_ht_jour, etat, dernier_vgp, prochain_vgp, certificat,
        infos_complementaires, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        designation, cmu, modele, marque, longueur, numeroSerie,
        prixHTValue, etat, dernierVGPValue, prochainVGPISO, certificat,
        infosComplementaires, statut || 'Sur Parc'
      ]
    );

    console.log("✅ Équipement ajouté:", result.rows[0]);
    res.json({ message: "✅ Équipement ajouté", equipment: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur insertion:", err.message, err.detail, err.stack);
    res.status(500).json({
      error: "Erreur lors de l'ajout",
      details: err.message,
      hint: err.detail
    });
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
      certificat, statut, client: clientName, debutLocation, finLocationTheorique, departEnlevement, numeroOffre, notesLocation,
      modele, marque, longueur, numeroSerie, prixHT, etat, motifMaintenance, debutMaintenance, minimumFacturation, minimumFacturationApply, idArticle, estPret, estLongDuree
    } = req.body;

    console.log(`📝 Body reçu:`, { statut, clientName, motifMaintenance, debutMaintenance, minimumFacturation, minimumFacturationApply });
    console.log(`📊 Body complet:`, JSON.stringify(req.body, null, 2));

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
    if (departEnlevement !== undefined) {
      updateFields.push(`depart_enlevement = $${paramIndex++}`);
      values.push(departEnlevement);
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
    if (minimumFacturation !== undefined) {
      updateFields.push(`minimum_facturation = $${paramIndex++}`);
      values.push(minimumFacturation);
    }
    if (minimumFacturationApply !== undefined) {
      updateFields.push(`minimum_facturation_apply = $${paramIndex++}`);
      values.push(minimumFacturationApply);
    }
    if (idArticle !== undefined) {
      updateFields.push(`id_article = $${paramIndex++}`);
      values.push(idArticle);
    }
    if (etat !== undefined) {
      updateFields.push(`etat = $${paramIndex++}`);
      values.push(etat);
    }
    if (estPret !== undefined) {
      updateFields.push(`est_pret = $${paramIndex++}`);
      values.push(estPret);
    }
    if (estLongDuree !== undefined) {
      updateFields.push(`est_long_duree = $${paramIndex++}`);
      values.push(estLongDuree);
    }

    if (updateFields.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);
    const query = `UPDATE equipments SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    console.log(`🔄 Exécution UPDATE...`);
    console.log(`📋 Champs à mettre à jour:`, updateFields);
    console.log(`📝 Valeurs:`, values.slice(0, -1));
    console.log(`🔍 Requête SQL:`, query);

    let result;
    try {
      result = await dbClient.query(query, values);
      console.log(`✅ UPDATE réussi`);
    } catch (sqlError) {
      console.error(`❌ Erreur SQL:`, sqlError.message);
      console.error(`🔍 Détail erreur:`, sqlError);
      await dbClient.query('ROLLBACK');
      throw sqlError;
    }

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
              equipment_id, motif_maintenance, note_retour, date_entree, date_sortie, duree_jours
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

    console.log(`📤 Équipement retourné au frontend:`, JSON.stringify(result.rows[0], null, 2));
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
    const { rentreeLe, noteRetour, minimumFacturationApply: minimumFromRequest } = req.body;

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

    // Déterminer le flag minimum facturation: utiliser la valeur envoyée du frontend ou celle de l'équipement
    const minimumFacturationApply = minimumFromRequest !== undefined ? minimumFromRequest : equipment.minimum_facturation_apply;

    console.log(`🔄 Retour équipement ${id}:`, { rentreeLe, noteRetour, minimumFacturationApply });

    // Convertir les dates au format ISO
    const debutLocationISO = convertFrenchDateToISO(equipment.debut_location);
    const finLocationTheoriqueISO = convertFrenchDateToISO(equipment.fin_location_theorique);
    const rentreLeISO = convertFrenchDateToISO(rentreeLe);

    // 2. Calculer le CA de la location
    // Les deux dates sont incluses (convention: du jour début inclus au jour retour inclus)
    const businessDays = calculateBusinessDays(debutLocationISO, rentreLeISO);

    const prixHT = equipment.prix_ht_jour ? parseFloat(equipment.prix_ht_jour) : null;
    const minimumFacturation = equipment.minimum_facturation ? parseFloat(equipment.minimum_facturation) : 0;
    const isLongDuration = businessDays && businessDays >= 21;
    let caTotal = null;
    let finalMinimumFacturation = minimumFacturation;

    if (businessDays && prixHT) {
      let calculatedCA;
      if (isLongDuration) {
        // Remise 20% pour location longue durée
        calculatedCA = (businessDays * prixHT * 0.8);
      } else {
        calculatedCA = (businessDays * prixHT);
      }

      // Si minimum de facturation est appliqué, TOUJOURS utiliser le minimum (pas le CA calculé)
      if (minimumFacturationApply) {
        // Toujours utiliser le minimum quand le flag est activé
        caTotal = minimumFacturation.toFixed(2);
        finalMinimumFacturation = minimumFacturation;
      } else {
        // Pas de minimum appliqué, utiliser le CA calculé
        caTotal = calculatedCA.toFixed(2);
        finalMinimumFacturation = 0;
      }
    }

    console.log(`📊 CA calculé: ${caTotal}€ HT (${businessDays} jours × ${prixHT}€/j${isLongDuration ? ' - 20% LD' : ''}${minimumFacturationApply ? `, Min: ${minimumFacturation}€` : ''})`);

    // 3. Archiver dans location_history avec le CA
    await dbClient.query(
      `INSERT INTO location_history (
        equipment_id, client, date_debut, date_fin_theorique, date_retour_reel,
        numero_offre, notes_location, note_retour, rentre_le,
        duree_jours_ouvres, prix_ht_jour, remise_ld, ca_total_ht,
        minimum_facturation_apply, minimum_facturation, est_pret
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
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
        caTotal,
        minimumFacturationApply || false,
        finalMinimumFacturation,
        equipment.est_pret || false
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

    // Vérifier d'abord que l'équipement existe
    const checkResult = await pool.query(
      `SELECT id, designation FROM equipments WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    const equipment = checkResult.rows[0];

    // Supprimer d'abord les dépendances (location_history, maintenance_history, etc.)
    await pool.query(
      `DELETE FROM location_history WHERE equipment_id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM maintenance_history WHERE equipment_id = $1`,
      [id]
    );

    // Puis supprimer l'équipement lui-même
    const deleteResult = await pool.query(
      `DELETE FROM equipments WHERE id = $1 RETURNING *`,
      [id]
    );

    console.log(`✅ Équipement ${id} (${equipment.designation}) supprimé avec succès`);
    res.json({
      message: "✅ Équipement supprimé avec succès",
      equipment: deleteResult.rows[0]
    });
  } catch (err) {
    console.error("❌ Erreur suppression:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
      error: "Erreur lors de la suppression",
      details: err.message
    });
  }
});

// ===== ROUTES CLIENTS =====

// GET tous les clients
app.get("/api/clients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM clients ORDER BY nom ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération clients:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// GET historique des locations d'un client (DOIT ÊTRE AVANT la route générique :id)
app.get("/api/clients/:id/location-history", async (req, res) => {
  try {
    const { id } = req.params;

    // D'abord, récupérer le nom du client
    const clientResult = await pool.query(
      `SELECT nom FROM clients WHERE id = $1`,
      [id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: "Client non trouvé" });
    }

    const clientName = clientResult.rows[0].nom;

    // Puis, récupérer l'historique des locations de ce client
    const result = await pool.query(
      `SELECT lh.*,
              e.designation as equipment_designation,
              e.cmu,
              e.numero_serie,
              e.longueur,
              e.modele,
              e.marque
       FROM location_history lh
       LEFT JOIN equipments e ON lh.equipment_id = e.id
       WHERE lh.client = $1
       ORDER BY lh.date_debut DESC`,
      [clientName]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur historique locations client:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique" });
  }
});

// GET un client spécifique
app.get("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM clients WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur récupération client:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// POST ajouter un nouveau client
app.post("/api/clients", async (req, res) => {
  try {
    const { nom, email, telephone, adresse, contact_principal, notes } = req.body;

    if (!nom) {
      return res.status(400).json({ error: "Le nom du client est requis" });
    }

    console.log("➕ Ajout nouveau client:", nom);

    const result = await pool.query(
      `INSERT INTO clients (nom, email, telephone, adresse, contact_principal, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nom, email || null, telephone || null, adresse || null, contact_principal || null, notes || null]
    );

    console.log("✅ Client ajouté:", result.rows[0]);
    res.json({ message: "✅ Client ajouté", client: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur insertion client:", err.message);
    if (err.code === '23505') {
      res.status(409).json({ error: "Ce nom de client existe déjà" });
    } else {
      res.status(500).json({ error: "Erreur lors de l'ajout", details: err.message });
    }
  }
});

// PATCH mettre à jour un client
app.patch("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone, adresse, contact_principal, notes } = req.body;

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (nom !== undefined) {
      updateFields.push(`nom = $${paramIndex++}`);
      values.push(nom);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (telephone !== undefined) {
      updateFields.push(`telephone = $${paramIndex++}`);
      values.push(telephone);
    }
    if (adresse !== undefined) {
      updateFields.push(`adresse = $${paramIndex++}`);
      values.push(adresse);
    }
    if (contact_principal !== undefined) {
      updateFields.push(`contact_principal = $${paramIndex++}`);
      values.push(contact_principal);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length <= 1) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);
    const query = `UPDATE clients SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client non trouvé" });
    }

    res.json({ message: "✅ Client mis à jour", client: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur mise à jour client:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// DELETE supprimer un client
app.delete("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Suppression client ${id}`);

    const result = await pool.query(
      `DELETE FROM clients WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client non trouvé" });
    }

    console.log(`✅ Client ${id} supprimé`);
    res.json({ message: "✅ Client supprimé", client: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur suppression client:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ===== ROUTES VGP CLIENTS =====

// GET tous les clients VGP
app.get("/api/vgp-clients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM vgp_clients ORDER BY nom ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération clients VGP:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// GET un client VGP spécifique
app.get("/api/vgp-clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM vgp_clients WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client VGP non trouvé" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur récupération client VGP:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// POST ajouter un nouveau client VGP
app.post("/api/vgp-clients", async (req, res) => {
  try {
    const { nom, email, telephone, adresse, contact_principal, notes } = req.body;

    if (!nom) {
      return res.status(400).json({ error: "Le nom du client est requis" });
    }

    console.log("➕ Ajout nouveau client VGP:", nom);

    const result = await pool.query(
      `INSERT INTO vgp_clients (nom, email, telephone, adresse, contact_principal, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nom, email || null, telephone || null, adresse || null, contact_principal || null, notes || null]
    );

    console.log("✅ Client VGP ajouté:", result.rows[0]);
    res.json({ message: "✅ Client VGP ajouté", client: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur insertion client VGP:", err.message);
    if (err.code === '23505') {
      res.status(409).json({ error: "Ce nom de client VGP existe déjà" });
    } else {
      res.status(500).json({ error: "Erreur lors de l'ajout", details: err.message });
    }
  }
});

// PATCH mettre à jour un client VGP
app.patch("/api/vgp-clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, email, telephone, adresse, contact_principal, notes } = req.body;

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (nom !== undefined) {
      updateFields.push(`nom = $${paramIndex++}`);
      values.push(nom);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (telephone !== undefined) {
      updateFields.push(`telephone = $${paramIndex++}`);
      values.push(telephone);
    }
    if (adresse !== undefined) {
      updateFields.push(`adresse = $${paramIndex++}`);
      values.push(adresse);
    }
    if (contact_principal !== undefined) {
      updateFields.push(`contact_principal = $${paramIndex++}`);
      values.push(contact_principal);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length <= 1) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);
    const query = `UPDATE vgp_clients SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client VGP non trouvé" });
    }

    res.json({ message: "✅ Client VGP mis à jour", client: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur mise à jour client VGP:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// DELETE supprimer un client VGP
app.delete("/api/vgp-clients/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Suppression client VGP ${id}`);

    const result = await pool.query(
      `DELETE FROM vgp_clients WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client VGP non trouvé" });
    }

    console.log(`✅ Client VGP ${id} supprimé`);
    res.json({ message: "✅ Client VGP supprimé", client: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur suppression client VGP:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ===== ROUTES SITES VGP (POUR CLIENTS) =====

// GET tous les sites d'un client VGP
app.get("/api/vgp-client-sites", async (req, res) => {
  try {
    const { client_id } = req.query;

    let query = `SELECT * FROM vgp_client_sites`;
    const params = [];

    if (client_id) {
      query += ` WHERE client_id = $1`;
      params.push(client_id);
    }

    query += ` ORDER BY nom ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération sites VGP:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// GET un site VGP spécifique
app.get("/api/vgp-client-sites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM vgp_client_sites WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Site VGP non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur récupération site VGP:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// POST ajouter un nouveau site VGP
app.post("/api/vgp-client-sites", async (req, res) => {
  try {
    const { client_id, nom, adresse, contact_site, notes } = req.body;

    if (!client_id || !nom || !adresse) {
      return res.status(400).json({ error: "client_id, nom et adresse sont requis" });
    }

    console.log(`📍 Création site VGP pour client ${client_id}: ${nom}`);

    const result = await pool.query(
      `INSERT INTO vgp_client_sites (client_id, nom, adresse, contact_site, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [client_id, nom, adresse, contact_site || null, notes || null]
    );

    console.log(`✅ Site VGP créé: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur création site VGP:", err.message);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

// PATCH mettre à jour un site VGP
app.patch("/api/vgp-client-sites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, adresse, contact_site, notes } = req.body;

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (nom !== undefined) {
      updateFields.push(`nom = $${paramIndex}`);
      values.push(nom);
      paramIndex++;
    }
    if (adresse !== undefined) {
      updateFields.push(`adresse = $${paramIndex}`);
      values.push(adresse);
      paramIndex++;
    }
    if (contact_site !== undefined) {
      updateFields.push(`contact_site = $${paramIndex}`);
      values.push(contact_site);
      paramIndex++;
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE vgp_client_sites SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Site VGP non trouvé" });
    }

    console.log(`✅ Site VGP ${id} mis à jour`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur mise à jour site VGP:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// DELETE supprimer un site VGP
app.delete("/api/vgp-client-sites/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Suppression site VGP ${id}`);

    const result = await pool.query(
      `DELETE FROM vgp_client_sites WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Site VGP non trouvé" });
    }

    console.log(`✅ Site VGP ${id} supprimé`);
    res.json({ message: "✅ Site VGP supprimé", site: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur suppression site VGP:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ===== ROUTES INTERVENTIONS VGP =====

// GET toutes les interventions VGP
app.get("/api/vgp-interventions", async (req, res) => {
  try {
    const { statut } = req.query;

    let query = `
      SELECT
        vi.id,
        vi.client_id,
        COALESCE(vi.client_nom, vc.nom) as client_nom,
        vi.site_id,
        COALESCE(vi.site_nom, vcs.nom) as site_nom,
        vi.adresse_intervention,
        vi.contact_site,
        TO_CHAR(vi.date_intervention, 'YYYY-MM-DD') as date_intervention,
        vi.duree_jours::numeric,
        vi.nature_intervention,
        vi.recommandations,
        vi.statut,
        vi.created_at,
        vi.updated_at
      FROM vgp_interventions vi
      LEFT JOIN vgp_clients vc ON vi.client_id = vc.id
      LEFT JOIN vgp_client_sites vcs ON vi.site_id = vcs.id
    `;
    const params = [];

    if (statut) {
      query += ` WHERE vi.statut = $1`;
      params.push(statut);
    }

    query += ` ORDER BY vi.date_intervention ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération interventions:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// GET une intervention VGP spécifique
app.get("/api/vgp-interventions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        vi.id,
        vi.client_id,
        COALESCE(vi.client_nom, vc.nom) as client_nom,
        vi.site_id,
        COALESCE(vi.site_nom, vcs.nom) as site_nom,
        vi.adresse_intervention,
        vi.contact_site,
        TO_CHAR(vi.date_intervention, 'YYYY-MM-DD') as date_intervention,
        vi.duree_jours::numeric,
        vi.recommandations,
        vi.statut,
        vi.created_at,
        vi.updated_at
      FROM vgp_interventions vi
      LEFT JOIN vgp_clients vc ON vi.client_id = vc.id
      LEFT JOIN vgp_client_sites vcs ON vi.site_id = vcs.id
      WHERE vi.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Intervention VGP non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur récupération intervention:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// POST créer une nouvelle intervention VGP
app.post("/api/vgp-interventions", async (req, res) => {
  try {
    const { client_id, client_nom, site_id, site_nom, adresse_intervention, contact_site, date_intervention, duree_jours, nature_intervention, recommandations } = req.body;

    if (!adresse_intervention || !date_intervention) {
      return res.status(400).json({ error: "adresse_intervention et date_intervention sont requis" });
    }

    console.log(`📅 Création intervention VGP: ${date_intervention}`);

    const result = await pool.query(
      `INSERT INTO vgp_interventions
        (client_id, client_nom, site_id, site_nom, adresse_intervention, contact_site, date_intervention, duree_jours, nature_intervention, recommandations, statut, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'planifiee', NOW(), NOW())
       RETURNING *`,
      [client_id || null, client_nom || null, site_id || null, site_nom || null, adresse_intervention, contact_site || null, date_intervention, duree_jours || 1.0, nature_intervention || null, recommandations || null]
    );

    console.log(`✅ Intervention créée: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur création intervention:", err.message);
    res.status(500).json({ error: "Erreur lors de la création" });
  }
});

// PATCH mettre à jour une intervention VGP
app.patch("/api/vgp-interventions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, client_nom, site_id, site_nom, adresse_intervention, contact_site, date_intervention, duree_jours, nature_intervention, recommandations, statut } = req.body;

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (client_id !== undefined) {
      updateFields.push(`client_id = $${paramIndex}`);
      values.push(client_id);
      paramIndex++;
    }
    if (client_nom !== undefined) {
      updateFields.push(`client_nom = $${paramIndex}`);
      values.push(client_nom);
      paramIndex++;
    }
    if (site_id !== undefined) {
      updateFields.push(`site_id = $${paramIndex}`);
      values.push(site_id);
      paramIndex++;
    }
    if (site_nom !== undefined) {
      updateFields.push(`site_nom = $${paramIndex}`);
      values.push(site_nom);
      paramIndex++;
    }
    if (adresse_intervention !== undefined) {
      updateFields.push(`adresse_intervention = $${paramIndex}`);
      values.push(adresse_intervention);
      paramIndex++;
    }
    if (contact_site !== undefined) {
      updateFields.push(`contact_site = $${paramIndex}`);
      values.push(contact_site);
      paramIndex++;
    }
    if (date_intervention !== undefined) {
      updateFields.push(`date_intervention = $${paramIndex}`);
      values.push(date_intervention);
      paramIndex++;
    }
    if (duree_jours !== undefined) {
      updateFields.push(`duree_jours = $${paramIndex}`);
      values.push(duree_jours);
      paramIndex++;
    }
    if (nature_intervention !== undefined) {
      updateFields.push(`nature_intervention = $${paramIndex}`);
      values.push(nature_intervention);
      paramIndex++;
    }
    if (recommandations !== undefined) {
      updateFields.push(`recommandations = $${paramIndex}`);
      values.push(recommandations);
      paramIndex++;
    }
    if (statut !== undefined) {
      updateFields.push(`statut = $${paramIndex}`);
      values.push(statut);
      paramIndex++;
    }

    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE vgp_interventions SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Intervention VGP non trouvée" });
    }

    console.log(`✅ Intervention ${id} mise à jour`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur mise à jour intervention:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// DELETE supprimer une intervention VGP
app.delete("/api/vgp-interventions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Suppression intervention VGP ${id}`);

    const result = await pool.query(
      `DELETE FROM vgp_interventions WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Intervention VGP non trouvée" });
    }

    console.log(`✅ Intervention ${id} supprimée`);
    res.json({ message: "✅ Intervention supprimée", intervention: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur suppression intervention:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ===== ROUTES VGP INTERVENTION EXECUTIONS =====

// GET execution data for an intervention
app.get("/api/vgp-interventions/:id/execution", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📋 Récupération execution intervention ${id}`);

    const result = await pool.query(
      `SELECT * FROM vgp_intervention_executions WHERE intervention_id = $1`,
      [id]
    );

    // Return null if no execution exists yet
    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Erreur GET execution:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération execution" });
  }
});

// POST/PUT execution data for an intervention (create or update)
app.post("/api/vgp-interventions/:id/execution", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      heure_debut,
      heure_fin,
      duree_effective_heures,
      equipements_controles,
      pieces_changees,
      observations,
      brouillon
    } = req.body;

    console.log(`💾 Sauvegarde execution intervention ${id}`);

    // Check if execution already exists
    const existing = await pool.query(
      `SELECT id FROM vgp_intervention_executions WHERE intervention_id = $1`,
      [id]
    );

    if (existing.rows.length > 0) {
      // UPDATE existing execution
      const result = await pool.query(
        `UPDATE vgp_intervention_executions
         SET heure_debut = $1,
             heure_fin = $2,
             duree_effective_heures = $3,
             equipements_controles = $4,
             pieces_changees = $5,
             observations = $6,
             brouillon = $7,
             updated_at = NOW()
         WHERE intervention_id = $8
         RETURNING *`,
        [
          heure_debut,
          heure_fin,
          duree_effective_heures,
          JSON.stringify(equipements_controles || []),
          JSON.stringify(pieces_changees || []),
          JSON.stringify(observations || []),
          brouillon !== false,
          id
        ]
      );

      console.log(`✅ Execution intervention ${id} mise à jour`);
      res.json(result.rows[0]);
    } else {
      // INSERT new execution
      const result = await pool.query(
        `INSERT INTO vgp_intervention_executions
         (intervention_id, heure_debut, heure_fin, duree_effective_heures,
          equipements_controles, pieces_changees, observations, brouillon)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id,
          heure_debut,
          heure_fin,
          duree_effective_heures,
          JSON.stringify(equipements_controles || []),
          JSON.stringify(pieces_changees || []),
          JSON.stringify(observations || []),
          brouillon !== false
        ]
      );

      console.log(`✅ Execution intervention ${id} créée`);
      res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error("❌ Erreur POST/PUT execution:", err.message);
    res.status(500).json({ error: "Erreur lors de la sauvegarde execution" });
  }
});

// ===== ROUTES PIECES DETACHEES =====

// GET toutes les pièces détachées
app.get("/api/spare-parts", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sp.*, e.designation as equipment_designation
       FROM spare_parts sp
       LEFT JOIN equipments e ON sp.equipment_id = e.id
       ORDER BY sp.reference ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération pièces:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// GET pièces détachées d'un équipement
app.get("/api/equipment/:id/spare-parts", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM spare_parts WHERE equipment_id = $1 ORDER BY reference ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération pièces équipement:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// POST ajouter une pièce détachée
app.post("/api/spare-parts", async (req, res) => {
  try {
    const { reference, designation, equipment_id, cost, quantity, supplier, notes } = req.body;

    if (!reference || !designation) {
      return res.status(400).json({ error: "Référence et désignation requises" });
    }

    console.log("➕ Ajout nouvelle pièce détachée:", reference);

    const result = await pool.query(
      `INSERT INTO spare_parts (reference, designation, equipment_id, cost, quantity, supplier, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [reference, designation, equipment_id || null, cost || null, quantity || 1, supplier || null, notes || null]
    );

    console.log("✅ Pièce détachée ajoutée:", result.rows[0]);
    res.json({ message: "✅ Pièce détachée ajoutée", sparePart: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur insertion pièce:", err.message);
    if (err.code === '23505') {
      res.status(409).json({ error: "Cette référence existe déjà" });
    } else {
      res.status(500).json({ error: "Erreur lors de l'ajout", details: err.message });
    }
  }
});

// PATCH mettre à jour une pièce détachée
app.patch("/api/spare-parts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, designation, equipment_id, cost, quantity, supplier, notes } = req.body;

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (reference !== undefined) {
      updateFields.push(`reference = $${paramIndex++}`);
      values.push(reference);
    }
    if (designation !== undefined) {
      updateFields.push(`designation = $${paramIndex++}`);
      values.push(designation);
    }
    if (equipment_id !== undefined) {
      updateFields.push(`equipment_id = $${paramIndex++}`);
      values.push(equipment_id);
    }
    if (cost !== undefined) {
      updateFields.push(`cost = $${paramIndex++}`);
      values.push(cost);
    }
    if (quantity !== undefined) {
      updateFields.push(`quantity = $${paramIndex++}`);
      values.push(quantity);
    }
    if (supplier !== undefined) {
      updateFields.push(`supplier = $${paramIndex++}`);
      values.push(supplier);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length <= 1) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);
    const query = `UPDATE spare_parts SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pièce détachée non trouvée" });
    }

    res.json({ message: "✅ Pièce détachée mise à jour", sparePart: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur mise à jour pièce:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// DELETE supprimer une pièce détachée
app.delete("/api/spare-parts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Suppression pièce détachée ${id}`);

    const result = await pool.query(
      `DELETE FROM spare_parts WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pièce détachée non trouvée" });
    }

    console.log(`✅ Pièce ${id} supprimée`);
    res.json({ message: "✅ Pièce détachée supprimée", sparePart: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur suppression pièce:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// ===== USAGE DE PIECES DETACHEES =====

// POST enregistrer l'utilisation d'une pièce lors d'une maintenance
app.post("/api/spare-parts/:id/usage", async (req, res) => {
  try {
    const { id } = req.params;
    const { maintenance_id, quantity_used, cost_used, notes } = req.body;

    console.log("➕ Utilisation pièce:", id);

    const result = await pool.query(
      `INSERT INTO spare_parts_usage (spare_part_id, maintenance_id, quantity_used, cost_used, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, maintenance_id || null, quantity_used || 1, cost_used || null, notes || null]
    );

    console.log("✅ Utilisation enregistrée:", result.rows[0]);
    res.json({ message: "✅ Utilisation enregistrée", usage: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur enregistrement utilisation:", err.message);
    res.status(500).json({ error: "Erreur lors de l'enregistrement", details: err.message });
  }
});

// GET historique utilisation d'une pièce
app.get("/api/spare-parts/:id/usage", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM spare_parts_usage WHERE spare_part_id = $1 ORDER BY date_used DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération utilisation:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// ===== ROUTES MAINTENANCE =====

// POST valider et sauvegarder une maintenance
app.post("/api/equipment/:id/maintenance/validate", async (req, res) => {
  const dbClient = await pool.connect();

  try {
    const { id } = req.params;

    // Log complet du body reçu
    console.log('📨 BODY REÇU COMPLET:', JSON.stringify(req.body, null, 2));

    const { motif, notes, pieces, tempsHeures, vgpEffectuee, technicien, vgp_effectuee } = req.body;

    // Accepter les deux formats (camelCase et snake_case)
    const vgpDone = vgpEffectuee !== undefined ? vgpEffectuee : vgp_effectuee;

    console.log(`✅ Validation maintenance équipement ${id}`);
    console.log('   - motif:', motif);
    console.log('   - notes:', notes);
    console.log('   - tempsHeures:', tempsHeures);
    console.log('   - vgpEffectuee (camelCase):', vgpEffectuee, 'type:', typeof vgpEffectuee);
    console.log('   - vgp_effectuee (snake_case):', vgp_effectuee, 'type:', typeof vgp_effectuee);
    console.log('   - vgpDone (valeur finale):', vgpDone, 'type:', typeof vgpDone);

    await dbClient.query('BEGIN');

    // Récupérer l'équipement pour avoir la date de début de maintenance
    const equipmentResult = await dbClient.query(
      'SELECT * FROM equipments WHERE id = $1',
      [id]
    );

    if (equipmentResult.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: "Équipement non trouvé" });
    }

    const equipment = equipmentResult.rows[0];

    // Calculer la durée de maintenance
    let dureeDays = null;
    if (equipment.debut_maintenance) {
      const debutMaintenance = new Date(equipment.debut_maintenance);
      const dateActuelle = new Date();
      dureeDays = Math.ceil((dateActuelle - debutMaintenance) / (1000 * 60 * 60 * 24));
    }

    // 1. Sauvegarder l'entrée de maintenance dans maintenance_history
    // Construire les détails des travaux en JSON (inclut duree_jours et vgp_effectuee)
    const travauxDetails = {
      notes_maintenance: notes || '',
      temps_heures: tempsHeures || 0,
      pieces_utilisees: pieces && pieces.length > 0 ? pieces : [],
      duree_jours: dureeDays,
      vgp_effectuee: vgpDone || false
    };

    console.log('📝 Détails maintenance:', travauxDetails);

    const maintenanceResult = await dbClient.query(
      `INSERT INTO maintenance_history
       (equipment_id, motif_maintenance, note_retour, travaux_effectues, technicien, date_entree, date_sortie)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        id,
        motif || 'Maintenance générale',
        notes || '',
        JSON.stringify(travauxDetails),
        technicien || '',
        equipment.debut_maintenance || new Date().toISOString()
      ]
    );

    console.log('✅ Maintenance enregistrée:', maintenanceResult.rows[0].id);
    console.log('📝 Détails sauvegardés:', travauxDetails);
    console.log('📅 VGP effectuée:', vgpDone);

    // 2. Mettre à jour le statut de l'équipement à "Sur Parc" et réinitialiser les champs de maintenance
    const equipmentUpdateResult = await dbClient.query(
      `UPDATE equipments
       SET statut = 'Sur Parc',
           motif_maintenance = NULL,
           debut_maintenance = NULL,
           note_retour = NULL
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    console.log('✅ Équipement remis sur parc');

    // 3. Si VGP effectuée, mettre à jour la date du prochain VGP (6 mois plus tard)
    if (vgpDone) {
      const nextVGPDate = new Date();
      nextVGPDate.setMonth(nextVGPDate.getMonth() + 6);
      const nextVGPISO = nextVGPDate.toISOString().split('T')[0];

      await dbClient.query(
        `UPDATE equipments
         SET prochain_vgp = $1, dernier_vgp = CURRENT_DATE
         WHERE id = $2`,
        [nextVGPISO, id]
      );
      console.log('✅ VGP mise à jour (+6 mois), prochain VGP:', nextVGPISO);
    }

    // Commit de la transaction
    await dbClient.query('COMMIT');

    res.json({
      message: "✅ Maintenance validée avec succès",
      maintenance: maintenanceResult.rows[0],
      equipment: equipmentUpdateResult.rows[0]
    });

  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error("❌ Erreur validation maintenance:", error.message, error.stack);
    res.status(500).json({ error: "Erreur lors de la validation de la maintenance", details: error.message });
  } finally {
    dbClient.release();
  }
});

// GET pièces en attente d'import depuis maintenances
// NOTE: Cette route retourne toujours une liste vide car le système a été changé
// Les pièces sont maintenant stockées directement dans maintenance_history.travaux_effectues
app.get("/api/maintenance-pieces/import-pending", async (req, res) => {
  try {
    // Récupérer les pièces depuis les maintenance_history (depuis travaux_effectues JSON)
    const result = await pool.query(
      `SELECT
        mh.id as maintenance_id,
        e.id as equipment_id,
        e.designation as equipment_designation,
        mh.date_entree,
        mh.travaux_effectues
       FROM maintenance_history mh
       LEFT JOIN equipments e ON mh.equipment_id = e.id
       WHERE mh.travaux_effectues IS NOT NULL
         AND mh.travaux_effectues::text LIKE '%pieces_utilisees%'
       ORDER BY mh.date_entree DESC`
    );

    // Formatter la réponse
    const formattedPieces = [];
    result.rows.forEach(row => {
      if (row.travaux_effectues && row.travaux_effectues.pieces_utilisees) {
        row.travaux_effectues.pieces_utilisees.forEach(piece => {
          formattedPieces.push({
            maintenance_id: row.maintenance_id,
            equipment_id: row.equipment_id,
            equipment_designation: row.equipment_designation,
            date_entree: row.date_entree,
            piece_designation: piece.designation,
            piece_quantity: piece.quantite || piece.quantity,
            piece_cost: piece.cost || 0
          });
        });
      }
    });

    res.json(formattedPieces);
  } catch (err) {
    console.error("❌ Erreur récupération pièces à importer:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// POST importer des pièces de maintenance dans l'inventaire
// NOTE: Les pièces sont maintenant intégrées directement lors de la validation de maintenance
app.post("/api/maintenance-pieces/import", async (req, res) => {
  const dbClient = await pool.connect();

  try {
    const { pieces } = req.body;

    if (!pieces || !Array.isArray(pieces) || pieces.length === 0) {
      return res.status(400).json({ error: "Liste de pièces requise" });
    }

    console.log(`📦 Import de ${pieces.length} pièces de maintenance`);

    await dbClient.query('BEGIN');

    const importedPieces = [];

    for (const piece of pieces) {
      // Vérifier si une pièce similaire existe déjà
      const existingResult = await dbClient.query(
        `SELECT * FROM spare_parts WHERE designation = $1 AND cost = $2 LIMIT 1`,
        [piece.piece_designation, piece.piece_cost]
      );

      if (existingResult.rows.length > 0) {
        // Mettre à jour la quantité existante
        const updatedResult = await dbClient.query(
          `UPDATE spare_parts
           SET quantity = quantity + $2
           WHERE id = $1
           RETURNING *`,
          [existingResult.rows[0].id, piece.piece_quantity]
        );
        importedPieces.push(updatedResult.rows[0]);
        console.log(`✅ Quantité mise à jour pour pièce existante: ${piece.piece_designation}`);
      } else {
        // Créer une nouvelle pièce
        const newResult = await dbClient.query(
          `INSERT INTO spare_parts (designation, quantity, cost, supplier, notes)
           VALUES ($1, $2, $3, 'Import Maintenance', $4)
           RETURNING *`,
          [piece.piece_designation, piece.piece_quantity, piece.piece_cost,
           `Importée de maintenance le ${new Date().toLocaleDateString('fr-FR')}`]
        );
        importedPieces.push(newResult.rows[0]);
        console.log(`✅ Nouvelle pièce importée: ${piece.piece_designation}`);
      }
    }

    await dbClient.query('COMMIT');

    res.json({
      message: `✅ ${pieces.length} pièces importées avec succès`,
      importedPieces: importedPieces
    });

  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error("❌ Erreur import pièces maintenance:", error.message);
    res.status(500).json({ error: "Erreur lors de l'import des pièces", details: error.message });
  } finally {
    dbClient.release();
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GESTION DES TARIFS MANQUANTS DANS L'HISTORIQUE
// ═══════════════════════════════════════════════════════════════════════════

// GET: Récupérer tous les historiques de location sans tarif (prix_ht_jour = NULL ou 0)
app.get("/api/location-history/missing-prices", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        lh.id,
        lh.equipment_id,
        e.designation as equipment_designation,
        e.cmu,
        e.marque,
        e.modele,
        lh.client,
        lh.date_debut,
        lh.date_fin_theorique,
        lh.date_retour_reel,
        lh.duree_jours_ouvres,
        lh.prix_ht_jour,
        e.prix_ht_jour as current_price,
        lh.ca_total_ht
       FROM location_history lh
       LEFT JOIN equipments e ON lh.equipment_id = e.id
       WHERE lh.prix_ht_jour IS NULL OR lh.prix_ht_jour = 0
       ORDER BY lh.date_debut DESC`
    );

    const missingCount = result.rows.length;
    const withCurrentPrice = result.rows.map(row => ({
      ...row,
      can_auto_fill: row.current_price && row.current_price > 0
    }));

    res.json({
      count: missingCount,
      locations: withCurrentPrice
    });

  } catch (err) {
    console.error("❌ Erreur récupération tarifs manquants:", err.message);
    res.status(500).json({ error: "Erreur lors de la récupération" });
  }
});

// PATCH: Mettre à jour le tarif d'un historique de location
app.patch("/api/location-history/:id/update-price", async (req, res) => {
  const dbClient = await pool.connect();

  try {
    const { id } = req.params;
    const { prix_ht_jour } = req.body;

    if (!prix_ht_jour || prix_ht_jour <= 0) {
      return res.status(400).json({ error: "Prix invalide" });
    }

    const prixNumber = parseFloat(prix_ht_jour);

    // Mettre à jour le tarif dans location_history
    const result = await dbClient.query(
      `UPDATE location_history
       SET prix_ht_jour = $1
       WHERE id = $2
       RETURNING *`,
      [prixNumber, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Historique de location non trouvé" });
    }

    console.log(`✅ Tarif mis à jour pour location_history ${id}: ${prixNumber}€/j`);

    res.json({
      message: "✅ Tarif mis à jour avec succès",
      location: result.rows[0]
    });

  } catch (err) {
    console.error("❌ Erreur mise à jour tarif:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour", details: err.message });
  } finally {
    dbClient.release();
  }
});

// PATCH: Remplir automatiquement les tarifs manquants avec le tarif actuel de l'équipement
app.patch("/api/location-history/auto-fill-prices", async (req, res) => {
  const dbClient = await pool.connect();

  try {
    await dbClient.query('BEGIN');

    // Récupérer tous les historiques sans tarif et associés à un équipement avec un tarif
    const missingPricesResult = await dbClient.query(
      `SELECT
        lh.id,
        lh.equipment_id,
        e.prix_ht_jour
       FROM location_history lh
       LEFT JOIN equipments e ON lh.equipment_id = e.id
       WHERE (lh.prix_ht_jour IS NULL OR lh.prix_ht_jour = 0)
       AND e.prix_ht_jour IS NOT NULL
       AND e.prix_ht_jour > 0`
    );

    let updatedCount = 0;
    const updates = [];

    for (const row of missingPricesResult.rows) {
      const updateResult = await dbClient.query(
        `UPDATE location_history
         SET prix_ht_jour = $1
         WHERE id = $2
         RETURNING id, equipment_id, prix_ht_jour`,
        [row.prix_ht_jour, row.id]
      );

      if (updateResult.rows.length > 0) {
        updatedCount++;
        updates.push(updateResult.rows[0]);
        console.log(`✅ Tarif auto-rempli pour location ${row.id}: ${row.prix_ht_jour}€/j`);
      }
    }

    await dbClient.query('COMMIT');

    res.json({
      message: `✅ ${updatedCount} tarifs mis à jour automatiquement`,
      updatedCount,
      updates
    });

  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error("❌ Erreur remplissage automatique tarifs:", err.message);
    res.status(500).json({ error: "Erreur lors du remplissage automatique", details: err.message });
  } finally {
    dbClient.release();
  }
});

// ===== ROUTES FEEDBACKS =====

// GET tous les feedbacks
app.get("/api/feedbacks", async (req, res) => {
  try {
    const { app: appFilter, status, type } = req.query;
    let query = `SELECT * FROM feedbacks WHERE status != 'deleted'`;
    const params = [];

    if (appFilter) {
      query += ` AND app = $${params.length + 1}`;
      params.push(appFilter);
    }
    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }
    if (type) {
      query += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY priority DESC, created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération feedbacks:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// GET feedbacks par application
app.get("/api/feedbacks/:app", async (req, res) => {
  try {
    const { app } = req.params;
    if (!['parc-loc', 'vgp-site'].includes(app)) {
      return res.status(400).json({ error: "App invalide" });
    }

    const result = await pool.query(
      `SELECT * FROM feedbacks WHERE app = $1 AND status != 'deleted' ORDER BY priority DESC, created_at DESC`,
      [app]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur récupération feedbacks app:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// POST ajouter un feedback
app.post("/api/feedbacks", async (req, res) => {
  try {
    const { app, type, message } = req.body;

    if (!['parc-loc', 'vgp-site'].includes(app)) {
      return res.status(400).json({ error: "App invalide" });
    }
    if (!['bug', 'suggestion'].includes(type)) {
      return res.status(400).json({ error: "Type invalide" });
    }
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message requis" });
    }

    console.log(`📝 Nouveau feedback ${type} pour ${app}: ${message.substring(0, 50)}...`);

    const result = await pool.query(
      `INSERT INTO feedbacks (app, type, message) VALUES ($1, $2, $3) RETURNING *`,
      [app, type, message.trim()]
    );

    console.log("✅ Feedback ajouté:", result.rows[0]);
    res.json({ message: "✅ Feedback envoyé", feedback: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur création feedback:", err.message);
    res.status(500).json({ error: "Erreur lors de l'envoi", details: err.message });
  }
});

// PATCH mettre à jour status/priority d'un feedback
app.patch("/api/feedbacks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (status && ['pending', 'validated', 'deleted'].includes(status)) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      updateFields.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (updateFields.length <= 1) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    values.push(id);
    const query = `UPDATE feedbacks SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Feedback non trouvé" });
    }

    console.log("✅ Feedback mis à jour:", result.rows[0]);
    res.json({ message: "✅ Feedback mis à jour", feedback: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur mise à jour feedback:", err.message);
    res.status(500).json({ error: "Erreur lors de la mise à jour" });
  }
});

// DELETE supprimer un feedback
app.delete("/api/feedbacks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE feedbacks SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Feedback non trouvé" });
    }

    console.log(`✅ Feedback ${id} supprimé`);
    res.json({ message: "✅ Feedback supprimé", feedback: result.rows[0] });
  } catch (err) {
    console.error("❌ Erreur suppression feedback:", err.message);
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});