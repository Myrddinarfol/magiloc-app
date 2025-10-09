import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const url = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: url.port,
  database: url.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("🔧 Migration: Ajout de la colonne duree_jours à maintenance_history");

    // Ajouter la colonne si elle n'existe pas
    await pool.query(`
      ALTER TABLE maintenance_history
      ADD COLUMN IF NOT EXISTS duree_jours INTEGER;
    `);

    console.log("✅ Colonne duree_jours ajoutée");

    // Vérifier la structure
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'maintenance_history'
      ORDER BY ordinal_position;
    `);

    console.log("\n📋 Structure de la table maintenance_history:");
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    await pool.end();
    console.log("\n✅ Migration terminée");
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}

migrate();
