import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utiliser DATABASE_URL pour se connecter
const DATABASE_URL = process.env.DATABASE_URL;
console.log('DEBUG DATABASE_URL:', DATABASE_URL);
const isRemote = DATABASE_URL?.includes('render.com') || DATABASE_URL?.includes('amazonaws.com');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isRemote ? {
    rejectUnauthorized: false
  } : false
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Début de la migration CA...');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'database', 'add_ca_column.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Exécuter la migration
    await client.query(sql);

    console.log('✅ Migration CA terminée avec succès !');

    // Vérifier les nouvelles colonnes
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'location_history'
      AND column_name IN ('duree_jours_ouvres', 'prix_ht_jour', 'remise_ld', 'ca_total_ht')
      ORDER BY column_name
    `);

    console.log('\n📊 Colonnes ajoutées:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

  } catch (err) {
    console.error('❌ Erreur lors de la migration:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter la migration
runMigration().catch(err => {
  console.error('💥 Échec de la migration:', err);
  process.exit(1);
});
