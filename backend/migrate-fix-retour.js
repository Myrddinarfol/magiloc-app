import pool from './database/db.js';

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔧 Migration : Ajout colonnes manquantes pour retours...');

    await client.query('BEGIN');

    // 1. Ajouter note_retour dans equipments
    await client.query(`
      ALTER TABLE equipments
      ADD COLUMN IF NOT EXISTS note_retour TEXT;
    `);
    console.log('✅ Colonne note_retour ajoutée à equipments');

    // 2. Créer table maintenance_history si elle n'existe pas
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_history (
        id SERIAL PRIMARY KEY,
        equipment_id INTEGER REFERENCES equipments(id) ON DELETE CASCADE,
        motif_maintenance TEXT,
        note_retour TEXT,
        date_entree TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_sortie TIMESTAMP,
        cout_reparation DECIMAL(10,2),
        notes TEXT
      );
    `);
    console.log('✅ Table maintenance_history créée');

    // 3. Ajouter colonnes manquantes dans location_history
    await client.query(`
      ALTER TABLE location_history
      ADD COLUMN IF NOT EXISTS date_retour_reel DATE,
      ADD COLUMN IF NOT EXISTS note_retour TEXT,
      ADD COLUMN IF NOT EXISTS rentre_le VARCHAR(50),
      ADD COLUMN IF NOT EXISTS duree_jours_ouvres INTEGER,
      ADD COLUMN IF NOT EXISTS prix_ht_jour DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS remise_ld BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ca_total_ht DECIMAL(10,2);
    `);
    console.log('✅ Colonnes CA ajoutées à location_history');

    // 4. Ajouter colonne debut_maintenance dans equipments
    await client.query(`
      ALTER TABLE equipments
      ADD COLUMN IF NOT EXISTS debut_maintenance TIMESTAMP;
    `);
    console.log('✅ Colonne debut_maintenance ajoutée à equipments');

    await client.query('COMMIT');
    console.log('🎉 Migration terminée avec succès !');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur migration:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
