/**
 * Fix script v2: Recalculate business days with INCLUSIVE dates convention
 *
 * Previous issue: Used exclusive end date (< endDate)
 * Correct convention: INCLUSIVE on both ends (<= endDate)
 *
 * Location from 25 Sept to 9 Oct (INCLUSIVE) = 11 business days
 */

import dotenv from 'dotenv';
import pool from './database/db.js';
import { calculateBusinessDays } from './utils/dateHelpers.js';

dotenv.config();

async function fixBusinessDays() {
  const client = await pool.connect();

  try {
    console.log('🔄 Recalcul des jours ouvrés avec convention INCLUSIVE (25 sept au 9 oct = 11 jours)...\n');

    // Récupérer tous les enregistrements
    const result = await client.query('SELECT * FROM location_history ORDER BY id');
    const locations = result.rows;

    console.log(`📊 ${locations.length} locations trouvées\n`);

    let updated = 0;

    for (const location of locations) {
      try {
        const dateDebut = location.date_debut;
        const dateRetour = location.rentre_le || location.date_retour_reel;

        if (!dateDebut || !dateRetour) {
          console.warn(`⚠️  Location #${location.id}: dates manquantes`);
          continue;
        }

        // IMPORTANT: Les colonnes 'date' de PG sont retournées comme Date objects
        // qui sont interprétées en UTC. Donc un 'date' de "2025-09-25" devient
        // "2025-09-24T22:00:00Z" en Date object à cause du décalage horaire (+02:00)
        // On ajoute 2 heures pour compenser et récupérer la vraie date
        const debutDate = dateDebut instanceof Date ? new Date(dateDebut.getTime() + 2 * 3600 * 1000) : new Date(dateDebut);
        const retourDate = dateRetour instanceof Date ? new Date(dateRetour.getTime() + 2 * 3600 * 1000) : new Date(dateRetour);

        const debutStr = debutDate.toISOString().split('T')[0];
        const retourStr = retourDate.toISOString().split('T')[0];

        // Recalculer avec la formule INCLUSIVE
        const businessDays = calculateBusinessDays(debutStr, retourStr);

        if (businessDays === null) {
          console.warn(`⚠️  Location #${location.id}: impossible de calculer`);
          continue;
        }

        // Recalculer le CA
        let caTotal = null;
        const prixHT = location.prix_ht_jour ? parseFloat(location.prix_ht_jour) : null;
        const minimumFacturation = location.minimum_facturation ? parseFloat(location.minimum_facturation) : 0;
        const isLongDuration = businessDays >= 21;

        if (businessDays && prixHT) {
          let calculatedCA = businessDays * prixHT;
          if (isLongDuration) {
            calculatedCA = calculatedCA * 0.8; // Remise 20%
          }

          if (location.minimum_facturation_apply && calculatedCA > minimumFacturation) {
            caTotal = parseFloat(calculatedCA.toFixed(2));
          } else if (location.minimum_facturation_apply) {
            caTotal = minimumFacturation;
          } else {
            caTotal = parseFloat(calculatedCA.toFixed(2));
          }
        }

        const oldDays = location.duree_jours_ouvres;
        const oldCA = location.ca_total_ht;

        if (oldDays !== businessDays || oldCA !== caTotal) {
          await client.query(
            'UPDATE location_history SET duree_jours_ouvres = $1, ca_total_ht = $2 WHERE id = $3',
            [businessDays, caTotal, location.id]
          );

          console.log(`✅ ID ${location.id}: ${debutStr} → ${retourStr}`);
          console.log(`   Jours: ${oldDays} → ${businessDays}${oldDays !== businessDays ? ' ⚠️' : ''}`);
          console.log(`   CA: ${oldCA}€ → ${caTotal}€${oldCA !== caTotal ? ' ⚠️' : ''}\n`);

          updated++;
        }

      } catch (err) {
        console.error(`❌ Location #${location.id}:`, err.message);
      }
    }

    console.log(`📈 Résumé: ${updated} locations mises à jour`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

fixBusinessDays();
