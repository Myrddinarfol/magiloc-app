import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion à la base de données
const pool = new Pool({
  host: "dpg-d3cpaq24d50c73coqc70-a.frankfurt-postgres.render.com",
  port: 5432,
  database: "magiloc",
  user: "magiloc_user",
  password: "WXI3h9gX0txmMzmOIo3bho6L6MmeEeXb",
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log("🚀 Démarrage de la migration...");

    // Lire le fichier SQL
    const migrationPath = path.join(__dirname, "database", "add_history_tables.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📄 Fichier SQL chargé");

    // Exécuter la migration
    await pool.query(migrationSQL);

    console.log("✅ Migration exécutée avec succès !");
    console.log("📊 Tables créées/modifiées :");
    console.log("   - equipments (colonne note_retour ajoutée)");
    console.log("   - location_history (colonnes améliorées)");
    console.log("   - maintenance_history (table créée)");
    console.log("   - Index optimisés créés");

    // Vérifier les tables
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('equipments', 'location_history', 'maintenance_history')
      ORDER BY table_name
    `);

    console.log("\n📋 Tables présentes dans la base :");
    result.rows.forEach(row => console.log(`   ✓ ${row.table_name}`));

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  }
}

runMigration();
