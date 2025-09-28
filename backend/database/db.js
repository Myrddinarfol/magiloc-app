import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚡ Connexion forcée à Render (External Database URL)
const pool = new Pool({
  host: "dpg-d3cpaq24d50c73coqc70-a.frankfurt-postgres.render.com",
  port: 5432,
  database: "magiloc",
  user: "magiloc_user",
  password: "WXI3h9gX0txmMzmOIo3bho6L6MmeEeXb",
  ssl: { rejectUnauthorized: false }
});

// Fonction pour exécuter le schema.sql
export async function initDb() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log("✅ Base de données initialisée avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors de l'initialisation de la base :", err);
  }
}

export default pool;
