import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://magiloc_mt5o_user:a7MM7PCbSCHNI68t3iCpu0X6XvJMcdxu@dpg-d3j5ujemcj7s739n4540-a.frankfurt-postgres.render.com/magiloc_mt5o";

async function migrate() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔗 Connecté à PostgreSQL Render');

    // 1. Ajouter colonne debut_maintenance si elle n'existe pas
    console.log('\n📝 Ajout colonne debut_maintenance...');
    await client.query(`
      ALTER TABLE equipments
      ADD COLUMN IF NOT EXISTS debut_maintenance TIMESTAMP;
    `);
    console.log('✅ Colonne debut_maintenance ajoutée');

    // 2. Renommer date_fin en date_fin_theorique dans location_history
    console.log('\n📝 Vérification colonne date_fin_theorique...');
    const checkCol = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'location_history'
      AND column_name = 'date_fin_theorique';
    `);

    if (checkCol.rows.length === 0) {
      console.log('🔄 Renommage date_fin → date_fin_theorique...');
      await client.query(`
        ALTER TABLE location_history
        RENAME COLUMN date_fin TO date_fin_theorique;
      `);
      console.log('✅ Colonne renommée');
    } else {
      console.log('✅ Colonne date_fin_theorique existe déjà');
    }

    // 3. Vérification finale
    console.log('\n🔍 Vérification structure tables...');

    const eqCols = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'equipments'
      AND column_name IN ('debut_maintenance', 'note_retour', 'motif_maintenance')
      ORDER BY column_name;
    `);
    console.log('📋 Colonnes equipments:', eqCols.rows.map(r => r.column_name));

    const histCols = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'location_history'
      AND column_name IN ('date_fin_theorique', 'note_retour', 'ca_total_ht')
      ORDER BY column_name;
    `);
    console.log('📋 Colonnes location_history:', histCols.rows.map(r => r.column_name));

    console.log('\n✅ Migration terminée avec succès !');

  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

migrate().catch(err => {
  console.error('💥 Échec migration:', err);
  process.exit(1);
});
