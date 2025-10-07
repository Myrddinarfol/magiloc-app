import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndFixSchema() {
  const client = await pool.connect();

  try {
    console.log('\n🔍 === VÉRIFICATION COMPLÈTE DES SCHÉMAS ===\n');

    // 1. Table equipments
    console.log('📊 TABLE: equipments');
    const equipCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'equipments'
      ORDER BY ordinal_position
    `);
    console.log('Colonnes actuelles:');
    equipCols.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));

    // 2. Table location_history
    console.log('\n📊 TABLE: location_history');
    const locCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'location_history'
      ORDER BY ordinal_position
    `);
    console.log('Colonnes actuelles:');
    locCols.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));

    // 3. Table maintenance_history
    console.log('\n📊 TABLE: maintenance_history');
    const maintCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'maintenance_history'
      ORDER BY ordinal_position
    `);
    console.log('Colonnes actuelles:');
    maintCols.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));

    // 4. Vérifier et corriger maintenance_history
    console.log('\n🔧 === CORRECTIONS maintenance_history ===\n');

    const maintColNames = maintCols.rows.map(r => r.column_name);

    // Vérifier duree_jours
    if (!maintColNames.includes('duree_jours')) {
      console.log('❌ Colonne duree_jours manquante');
      if (maintColNames.includes('duree')) {
        console.log('🔧 Renommage duree → duree_jours');
        await client.query('ALTER TABLE maintenance_history RENAME COLUMN duree TO duree_jours');
        console.log('✅ Colonne renommée');
      } else {
        console.log('➕ Ajout colonne duree_jours');
        await client.query('ALTER TABLE maintenance_history ADD COLUMN duree_jours INTEGER');
        console.log('✅ Colonne ajoutée');
      }
    } else {
      console.log('✅ Colonne duree_jours existe');
    }

    // 5. Vérifier et corriger location_history
    console.log('\n🔧 === CORRECTIONS location_history ===\n');

    const locColNames = locCols.rows.map(r => r.column_name);

    // Liste des colonnes attendues avec snake_case
    const expectedCols = [
      { old: 'duree', new: 'duree_jours_ouvres', type: 'INTEGER' },
      { old: 'prixHTJour', new: 'prix_ht_jour', type: 'NUMERIC' },
      { old: 'remiseLD', new: 'remise_ld', type: 'NUMERIC' },
      { old: 'caTotalHT', new: 'ca_total_ht', type: 'NUMERIC' }
    ];

    for (const col of expectedCols) {
      if (!locColNames.includes(col.new)) {
        if (locColNames.includes(col.old)) {
          console.log(`🔧 Renommage ${col.old} → ${col.new}`);
          await client.query(`ALTER TABLE location_history RENAME COLUMN "${col.old}" TO ${col.new}`);
          console.log('✅ Colonne renommée');
        } else {
          console.log(`➕ Ajout colonne ${col.new}`);
          await client.query(`ALTER TABLE location_history ADD COLUMN ${col.new} ${col.type}`);
          console.log('✅ Colonne ajoutée');
        }
      } else {
        console.log(`✅ Colonne ${col.new} existe`);
      }
    }

    // 6. Afficher schémas finaux
    console.log('\n📋 === SCHÉMAS FINAUX ===\n');

    const finalMaint = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'maintenance_history'
      ORDER BY ordinal_position
    `);
    console.log('maintenance_history:');
    finalMaint.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));

    const finalLoc = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'location_history'
      ORDER BY ordinal_position
    `);
    console.log('\nlocation_history:');
    finalLoc.rows.forEach(r => console.log(`  - ${r.column_name}: ${r.data_type}`));

    console.log('\n✅ === VÉRIFICATION TERMINÉE ===\n');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndFixSchema();
