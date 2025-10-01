import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: "dpg-d3cpaq24d50c73coqc70-a.frankfurt-postgres.render.com",
  port: 5432,
  database: "magiloc",
  user: "magiloc_user",
  password: "WXI3h9gX0txmMzmOIo3bho6L6MmeEeXb",
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("🔄 Exécution de la migration...");

    const migrationPath = path.join(__dirname, "database", "add_location_columns.sql");
    const migration = fs.readFileSync(migrationPath, "utf8");

    await pool.query(migration);
    console.log("✅ Migration réussie !");

    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur migration:", err);
    process.exit(1);
  }
}

migrate();
