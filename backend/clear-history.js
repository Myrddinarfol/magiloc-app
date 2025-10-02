import pg from 'pg';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const isRemote = DATABASE_URL?.includes('render.com') || DATABASE_URL?.includes('amazonaws.com');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isRemote ? {
    rejectUnauthorized: false
  } : false
});

async function clearHistory() {
  const client = await pool.connect();

  try {
    console.log('🔄 Suppression des historiques de location...');

    // Supprimer tous les historiques de location
    const result = await client.query('DELETE FROM location_history');

    console.log(`✅ ${result.rowCount} historique(s) de location supprimé(s)`);

  } catch (err) {
    console.error('❌ Erreur lors de la suppression:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter
clearHistory().catch(err => {
  console.error('💥 Échec:', err);
  process.exit(1);
});
