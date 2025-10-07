import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Toujours SSL pour Render
});

async function fixMaintenanceHistory() {
  const client = await pool.connect();

  try {
    console.log('🔍 Vérification de la structure de maintenance_history...');

    // Vérifier les colonnes existantes
    const columns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'maintenance_history'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colonnes actuelles:', columns.rows.map(r => r.column_name).join(', '));

    // Vérifier si la colonne 'motif' existe
    const hasMotif = columns.rows.some(r => r.column_name === 'motif');
    const hasMotifMaintenance = columns.rows.some(r => r.column_name === 'motif_maintenance');

    if (!hasMotif && hasMotifMaintenance) {
      console.log('🔧 Renommage motif_maintenance → motif');
      await client.query('ALTER TABLE maintenance_history RENAME COLUMN motif_maintenance TO motif');
      console.log('✅ Colonne renommée');
    } else if (!hasMotif && !hasMotifMaintenance) {
      console.log('➕ Ajout colonne motif');
      await client.query('ALTER TABLE maintenance_history ADD COLUMN motif TEXT');
      console.log('✅ Colonne ajoutée');
    } else {
      console.log('✅ Colonne motif existe déjà');
    }

    // Vérifier la colonne note_retour
    const hasNoteRetour = columns.rows.some(r => r.column_name === 'note_retour');
    const hasNotes = columns.rows.some(r => r.column_name === 'notes');

    if (!hasNoteRetour && hasNotes) {
      console.log('🔧 Renommage notes → note_retour');
      await client.query('ALTER TABLE maintenance_history RENAME COLUMN notes TO note_retour');
      console.log('✅ Colonne renommée');
    } else if (!hasNoteRetour && !hasNotes) {
      console.log('➕ Ajout colonne note_retour');
      await client.query('ALTER TABLE maintenance_history ADD COLUMN note_retour TEXT');
      console.log('✅ Colonne ajoutée');
    } else {
      console.log('✅ Colonne note_retour existe déjà');
    }

    // Afficher la structure finale
    const finalColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'maintenance_history'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Structure finale de maintenance_history:');
    finalColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n✅ Migration terminée avec succès !');

  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

fixMaintenanceHistory();
