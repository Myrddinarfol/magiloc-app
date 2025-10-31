#!/usr/bin/env node

/**
 * Script de correction de l'historique de location V2
 * Recalcule le CA pour TOUS les retours en utilisant le minimum de facturation de l'équipement
 *
 * ATTENTION: Ce script modifie les données existantes dans la base de données
 */

import pool from './database/db.js';
import { calculateBusinessDays } from './utils/dateHelpers.js';

const fixLocationHistoryCA = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Correction de l\'historique de location (v2)...\n');

    // Récupérer tous les historiques
    const result = await client.query(`
      SELECT
        lh.id,
        lh.equipment_id,
        lh.date_debut,
        lh.date_retour_reel,
        lh.duree_jours_ouvres,
        lh.prix_ht_jour,
        lh.minimum_facturation_apply,
        lh.minimum_facturation,
        lh.ca_total_ht,
        lh.remise_ld,
        e.minimum_facturation as equipment_minimum,
        e.minimum_facturation_apply as equipment_minimum_apply
      FROM location_history lh
      LEFT JOIN equipments e ON lh.equipment_id = e.id
      ORDER BY lh.date_debut DESC
    `);

    if (result.rows.length === 0) {
      console.log('✅ Aucun historique de location trouvé');
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
        remise_ld,
        equipment_minimum,
        equipment_minimum_apply
      } = record;

      // Utiliser le minimum de l'équipement si disponible
      const shouldApplyMinimum = equipment_minimum_apply === true;
      const minimumFact = parseFloat(equipment_minimum || minimum_facturation || 0);
      const prixHT = parseFloat(prix_ht_jour);
      const businessDays = parseInt(duree_jours_ouvres);
      const isLongDuration = businessDays >= 21;

      let calculatedCA;
      if (isLongDuration) {
        calculatedCA = (businessDays * prixHT * 0.8);
      } else {
        calculatedCA = (businessDays * prixHT);
      }

      // Déterminer le CA correct
      let correctCA, correctMinApply, correctMinAmount;

      if (shouldApplyMinimum && minimumFact > 0) {
        // Appliquer le minimum
        correctCA = minimumFact.toFixed(2);
        correctMinApply = true;
        correctMinAmount = minimumFact.toFixed(2);
      } else {
        // Pas de minimum, utiliser le CA calculé
        correctCA = calculatedCA.toFixed(2);
        correctMinApply = false;
        correctMinAmount = 0;
      }

      const currentCA = parseFloat(ca_total_ht).toFixed(2);
      const currentMinApply = minimum_facturation_apply === true || minimum_facturation_apply === 1;
      const currentMinAmount = parseFloat(minimum_facturation).toFixed(2);

      // Vérifier si correction nécessaire
      if (parseFloat(correctCA) !== parseFloat(currentCA) ||
          correctMinApply !== currentMinApply ||
          (correctMinApply && parseFloat(correctMinAmount) !== parseFloat(currentMinAmount))) {

        // Mettre à jour
        await client.query(
          `UPDATE location_history
           SET ca_total_ht = $1, minimum_facturation_apply = $2, minimum_facturation = $3
           WHERE id = $4`,
          [correctCA, correctMinApply, correctMinAmount, id]
        );

        console.log(`✏️  [ID ${id} | Équipement ${equipment_id}]`);
        console.log(`   Ancien CA: ${currentCA}€ (Min: ${currentMinAmount}€, Appliqué: ${currentMinApply})`);
        console.log(`   Nouveau CA: ${correctCA}€ (Min: ${correctMinAmount}€, Appliqué: ${correctMinApply})`);

        if (shouldApplyMinimum && minimumFact > 0) {
          console.log(`   Raison: Minimum de facturation ${correctMinAmount}€ appliqué (${businessDays}j × ${prixHT}€/j = ${calculatedCA.toFixed(2)}€ < minimum)`);
        }
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
