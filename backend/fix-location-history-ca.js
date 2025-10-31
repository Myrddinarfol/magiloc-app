#!/usr/bin/env node

/**
 * Script de correction de l'historique de location
 * Recalcule le CA pour tous les retours avec minimum de facturation appliqué
 *
 * ATTENTION: Ce script modifie les données existantes dans la base de données
 */

import pool from './database/db.js';
import { calculateBusinessDays } from './utils/dateHelpers.js';

const fixLocationHistoryCA = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Correction de l\'historique de location...\n');

    // Récupérer tous les historiques avec minimum de facturation appliqué
    const result = await client.query(`
      SELECT
        id,
        equipment_id,
        date_debut,
        date_retour_reel,
        duree_jours_ouvres,
        prix_ht_jour,
        minimum_facturation_apply,
        minimum_facturation,
        ca_total_ht,
        remise_ld
      FROM location_history
      WHERE minimum_facturation_apply = true
      ORDER BY date_debut DESC
    `);

    if (result.rows.length === 0) {
      console.log('✅ Aucun historique avec minimum de facturation à corriger');
      return;
    }

    console.log(`📋 Trouvé ${result.rows.length} enregistrements à vérifier\n`);

    let corrected = 0;
    let unchanged = 0;

    for (const record of result.rows) {
      const {
        id,
        equipment_id,
        date_debut,
        date_retour_reel,
        duree_jours_ouvres,
        prix_ht_jour,
        minimum_facturation_apply,
        minimum_facturation,
        ca_total_ht,
        remise_ld
      } = record;

      // Recalculer le CA correctement
      const prixHT = parseFloat(prix_ht_jour);
      const minimumFact = parseFloat(minimum_facturation);
      const businessDays = parseInt(duree_jours_ouvres);
      const isLongDuration = businessDays >= 21;

      let calculatedCA;
      if (isLongDuration) {
        calculatedCA = (businessDays * prixHT * 0.8);
      } else {
        calculatedCA = (businessDays * prixHT);
      }

      // Si minimum appliqué, le CA doit être le minimum
      const correctCA = minimumFact.toFixed(2);
      const currentCA = parseFloat(ca_total_ht).toFixed(2);

      if (parseFloat(correctCA) !== parseFloat(currentCA)) {
        // Mettre à jour
        await client.query(
          `UPDATE location_history
           SET ca_total_ht = $1
           WHERE id = $2`,
          [correctCA, id]
        );

        console.log(`✏️  [Équipement ${equipment_id}]`);
        console.log(`   Ancien CA: ${currentCA}€ (basé sur ${businessDays} jours × ${prixHT}€/j = ${calculatedCA.toFixed(2)}€)`);
        console.log(`   Nouveau CA: ${correctCA}€ (minimum appliqué)`);
        console.log();

        corrected++;
      } else {
        unchanged++;
      }
    }

    console.log(`\n📊 Résultats:`);
    console.log(`   ✅ Corrigés: ${corrected}`);
    console.log(`   ⚪ Inchangés: ${unchanged}`);
    console.log(`   📈 Total: ${result.rows.length}`);

    if (corrected > 0) {
      console.log(`\n🎉 L'historique a été mis à jour avec succès!`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

// Lancer le script
fixLocationHistoryCA().then(() => {
  console.log('\n✅ Script terminé');
  process.exit(0);
});
