import pool from './database/db.js';

async function checkDates() {
  try {
    const result = await pool.query(
      `SELECT id, date_debut, rentre_le, date_retour_reel, duree_jours_ouvres
       FROM location_history
       WHERE id IN (5, 6)
       ORDER BY id`
    );

    console.log('Location History Entries:\n');
    result.rows.forEach(row => {
      console.log(`ID ${row.id}:`);
      console.log(`  date_debut: ${row.date_debut}`);
      console.log(`  rentre_le: ${row.rentre_le}`);
      console.log(`  date_retour_reel: ${row.date_retour_reel}`);
      console.log(`  duree_jours_ouvres: ${row.duree_jours_ouvres}`);
      console.log('');
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDates();
