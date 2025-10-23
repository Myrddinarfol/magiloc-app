/**
 * Fix script: Recalculate business days in location_history
 *
 * Issue: The calculateBusinessDays function previously used inclusive counting on both ends (<=)
 * instead of the rental industry standard (inclusive start, exclusive end).
 *
 * This script:
 * 1. Reads all location_history records
 * 2. Recalculates duree_jours_ouvres with the correct formula
 * 3. Recalculates ca_total_ht based on the new business days count
 * 4. Updates all records in the database
 */

import dotenv from 'dotenv';
import pool from './database/db.js';
import { calculateBusinessDays, formatDateToFrench } from './utils/dateHelpers.js';

dotenv.config();

// French holidays 2025-2026
const FRENCH_HOLIDAYS = [
  '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09',
  '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
  '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25',
  '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25'
];

async function fixBusinessDays() {
  const client = await pool.connect();

  try {
    console.log('🔄 Démarrage correction des jours ouvrés dans location_history...\n');

    // 1. Récupérer tous les enregistrements de location_history
    const result = await client.query('SELECT * FROM location_history ORDER BY id');
    const locations = result.rows;

    console.log(`📊 ${locations.length} locations trouvées dans l'historique\n`);

    let updated = 0;
    let errors = 0;

    // 2. Traiter chaque location
    for (const location of locations) {
      try {
        // Récupérer les dates
        const dateDebut = location.date_debut;
        const dateRetour = location.rentre_le || location.date_retour_reel;

        if (!dateDebut || !dateRetour) {
          console.warn(`⚠️  Location #${location.id}: dates manquantes (début: ${dateDebut}, retour: ${dateRetour})`);
          continue;
        }

        // Recalculer les jours ouvrés avec la formule CORRECTE
        const rawBusinessDays = calculateBusinessDays(dateDebut, dateRetour);

        if (rawBusinessDays === null) {
          console.warn(`⚠️  Location #${location.id}: impossible de calculer les jours ouvrés`);
          continue;
        }

        // IMPORTANT: Par convention de location, le jour de retour n'est PAS facturé
        // Donc on soustrait 1 jour du calcul (minimum 1: une location = au moins 1 jour facturé)
        const businessDays = Math.max(1, rawBusinessDays > 0 ? rawBusinessDays - 1 : rawBusinessDays);

        // Recalculer le CA avec les nouveaux jours ouvrés
        let caTotal = null;
        const prixHT = location.prix_ht_jour ? parseFloat(location.prix_ht_jour) : null;
        const minimumFacturation = location.minimum_facturation ? parseFloat(location.minimum_facturation) : 0;
        const isLongDuration = businessDays >= 21;
        let finalMinimumFacturation = minimumFacturation;

        if (businessDays && prixHT) {
          let calculatedCA;
          if (isLongDuration) {
            calculatedCA = (businessDays * prixHT * 0.8);
          } else {
            calculatedCA = (businessDays * prixHT);
          }

          if (location.minimum_facturation_apply && calculatedCA > minimumFacturation) {
            caTotal = parseFloat(calculatedCA.toFixed(2));
            finalMinimumFacturation = minimumFacturation;
          } else if (location.minimum_facturation_apply) {
            caTotal = minimumFacturation;
          } else {
            caTotal = parseFloat(calculatedCA.toFixed(2));
            finalMinimumFacturation = 0;
          }
        }

        // Vérifier si les valeurs ont changé
        const oldBusinessDays = location.duree_jours_ouvres;
        const oldCA = location.ca_total_ht;
        const hasChanged = oldBusinessDays !== businessDays || oldCA !== caTotal;

        if (hasChanged) {
          // 3. Mettre à jour la base de données
          await client.query(
            `UPDATE location_history
             SET duree_jours_ouvres = $1, ca_total_ht = $2
             WHERE id = $3`,
            [businessDays, caTotal, location.id]
          );

          console.log(`✅ Location #${location.id} | ${formatDateToFrench(dateDebut)} → ${formatDateToFrench(dateRetour)}`);
          console.log(`   Jours ouvrés: ${oldBusinessDays} → ${businessDays}${oldBusinessDays !== businessDays ? ' ⚠️ CHANGÉ' : ''}`);
          console.log(`   CA HT: ${oldCA}€ → ${caTotal}€${oldCA !== caTotal ? ' ⚠️ CHANGÉ' : ''}\n`);

          updated++;
        }

      } catch (err) {
        console.error(`❌ Erreur lors du traitement de la location #${location.id}:`, err.message);
        errors++;
      }
    }

    console.log(`\n📈 Résumé:`);
    console.log(`   ✅ ${updated} locations mises à jour`);
    console.log(`   ❌ ${errors} erreurs`);
    console.log(`   ⏭️  ${locations.length - updated - errors} locations inchangées\n`);

  } catch (err) {
    console.error('❌ Erreur critique:', err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

// Lancer le script
fixBusinessDays().catch(err => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});
