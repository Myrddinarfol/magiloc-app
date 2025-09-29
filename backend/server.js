import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool, { initDb } from "./database/db.js";

dotenv.config();
console.log("DEBUG DATABASE_URL:", process.env.DATABASE_URL);

const cors = require('cors');

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

const app = express();
const PORT = process.env.PORT || 5000;

// Init DB
initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Routes de base
app.get("/", (req, res) => {
  res.json({ message: "MagiLoc API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Route équipements (lecture des 5 premiers)
app.get("/equipments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM equipments LIMIT 5");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Erreur DB:", err.message);
    res.status(500).json({ error: "Erreur base de données" });
  }
});

// Route pour ajouter un équipement test
app.post("/equipments/add", async (req, res) => {
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
