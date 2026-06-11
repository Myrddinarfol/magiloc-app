#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Client } = pg;

const cleanup = async () => {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'magiloc_dev',
    user: 'postgres',
    password: 'MAGILOC25'
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    console.log('🧹 NETTOYAGE DES DONNÉES D\'ANALYTICS ET PERFORMANCES\n');
    console.log('⚠️  Suppression en cours...\n');

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
        client_id = NULL,
        debut_location = NULL,
        fin_location_theorique = NULL,
        depart_enlevement = NULL,
        rentre_le = NULL,
        numero_offre = NULL,
        notes_location = NULL,
        note_retour = NULL,
        est_long_duree = false,
        est_pret = false
      WHERE client IS NOT NULL
        OR client_id IS NOT NULL
        OR debut_location IS NOT NULL
        OR est_long_duree = true
        OR est_pret = true
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
    await client.end();
  }
};

cleanup().then(() => process.exit(0));
