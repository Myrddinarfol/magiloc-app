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
    'http://localhost:3000',  // Développement local
    'https://magiloc-backend.onrender.com',  // Backend lui-même
    /\.vercel\.app$/  // Tous les domaines Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Route équipements
app.get("/api/equipment", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM equipments ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur DB:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
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

// Route pour importer plusieurs équipements
app.post("/api/equipment/import", async (req, res) => {
  try {
    const equipments = req.body;
    console.log(`📥 Import de ${equipments.length} équipements`);

    // Utilise une transaction pour tout importer d'un coup
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const eq of equipments) {
        await client.query(
          `INSERT INTO equipments (designation, cmu, modele, marque, longueur, 
           infos_complementaires, numero_serie, prix_ht_jour, etat, 
           certificat, dernier_vgp, prochain_vgp, statut) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (numero_serie) DO UPDATE SET
           designation = EXCLUDED.designation,
           cmu = EXCLUDED.cmu,
           modele = EXCLUDED.modele`,
          [
            eq.designation, eq.cmu, eq.modele, eq.marque, eq.longueur,
            eq.infosComplementaires, eq.numeroSerie, eq.prixHT, eq.etat,
            eq.certificat, eq.dernierVGP, eq.prochainVGP, eq.disponibilite
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});