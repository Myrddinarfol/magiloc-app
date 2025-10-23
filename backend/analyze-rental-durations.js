import pool from './database/db.js';
import { calculateBusinessDays } from './utils/dateHelpers.js';

async function analyze() {
  try {
    const result = await pool.query(
      `SELECT id, date_debut, rentre_le, duree_jours_ouvres
       FROM location_history
       ORDER BY duree_jours_ouvres ASC`
    );

    console.log('Location Durations Analysis:\n');
    console.log('ID  | Begin       | Return      | Stored Days | Calc Days (raw) | Calc Days (-1) | Expected?');
    console.log('-'.repeat(100));

    result.rows.forEach(row => {
      const raw = calculateBusinessDays(row.date_debut, row.rentre_le);
      const adjusted = Math.max(0, raw - 1);
      const stored = row.duree_jours_ouvres;

      const beginStr = row.date_debut.toISOString().split('T')[0];
      const returnStr = row.rentre_le;

      console.log(`${String(row.id).padStart(3)} | ${beginStr} | ${returnStr} | ${String(stored).padStart(11)} | ${String(raw).padStart(15)} | ${String(adjusted).padStart(14)} |`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

analyze();
