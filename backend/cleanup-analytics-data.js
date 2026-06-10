#!/usr/bin/env node

import pool from './database/db.js';

const cleanup = async () => {
  const client = await pool.connect();

  try {
    console.log('🧹 NETTOYAGE DES DONNÉES D\'ANALYTICS ET PERFORMANCES\n');
    console.log('⚠️  Attention: Cela va supprimer TOUTES les données de location historique');
    console.log('   La structure des tables sera conservée intacte.\n');

    // 1. Supprimer tous les enregistrements de locations (en cours)
    console.log('📍 Suppression des locations en cours...');
    const locationsResult = await client.query(`
      DELETE FROM locations
    `);
    console.log(`✅ ${locationsResult.rowCount} locations en cours supprimées`);

    // 2. Supprimer tous les enregistrements de location_history
    console.log('📊 Suppression de location_history...');
    const locationHistoryResult = await client.query(`
      DELETE FROM location_history
    `);
    console.log(`✅ ${locationHistoryResult.rowCount} enregistrements supprimés de location_history\n`);

    // 3. Réinitialiser les données de location dans les équipements
    console.log('🔧 Réinitialisation des équipements...');
    const equipmentResult = await client.query(`
      UPDATE equipments
      SET
        client = NULL,
        date_debut = NULL,
        date_fin_prevue = NULL,
        est_long_duree = false,
        remise_ld = 0,
        prix_journalier_location = tarif_journalier,
        ca_total_ht = 0,
        ca_total_ttc = 0,
        remise_ld_appliquee = 0,
        remise_ld_appliquee_ttc = 0
      WHERE client IS NOT NULL
        OR date_debut IS NOT NULL
        OR date_fin_prevue IS NOT NULL
    `);
    console.log(`✅ ${equipmentResult.rowCount} équipements réinitialisés\n`);

    // 4. Vérification finale
    console.log('📋 VÉRIFICATION FINALE\n');

    const locationsCount = await client.query(`
      SELECT COUNT(*) as count FROM locations
    `);
    console.log(`   Locations en cours: ${locationsCount.rows[0].count}`);

    const locationHistoryCount = await client.query(`
      SELECT COUNT(*) as count FROM location_history
    `);
    console.log(`   Enregistrements location_history: ${locationHistoryCount.rows[0].count}`);

    const equipmentLocated = await client.query(`
      SELECT COUNT(*) as count FROM equipments
      WHERE client IS NOT NULL
    `);
    console.log(`   Équipements avec client actif: ${equipmentLocated.rows[0].count}`);

    const equipmentCount = await client.query(`
      SELECT COUNT(*) as count FROM equipments
    `);
    console.log(`   Total équipements: ${equipmentCount.rows[0].count}\n`);

    console.log('✅ NETTOYAGE COMPLÉTÉ AVEC SUCCÈS!');
    console.log('\n📝 Résumé:');
    console.log('   • Toutes les données d\'historique de location supprimées');
    console.log('   • Tous les équipements réinitialisés');
    console.log('   • Structure des tables conservée intacte');
    console.log('   • Vous pouvez recommencer le suivi du parc\n');

  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

cleanup().then(() => process.exit(0));
