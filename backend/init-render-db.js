/**
 * Script pour initialiser la NOUVELLE base de données Render
 * À exécuter UNE SEULE FOIS après création de la nouvelle base
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nouvelle URL de connexion Render
const DATABASE_URL = "postgresql://magiloc_mt5o_user:a7MM7PCbSCHNI68t3iCpu0X6XvJMcdxu@dpg-d3j5ujemcj7s739n4540-a.frankfurt-postgres.render.com/magiloc_mt5o";

console.log('🚀 Initialisation de la nouvelle base de données Render...\n');

async function initDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connecté avec succès\n');

    // Lire le schéma SQL
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📜 Exécution du schéma SQL...');
    await client.query(schema);
    console.log('✅ Schéma créé avec succès\n');

    // Vérifier les tables créées
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📊 Tables créées dans la base :');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('👉 Vous pouvez maintenant importer votre CSV depuis l\'application');

  } catch (err) {
    console.error('\n❌ Erreur lors de l\'initialisation :', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
