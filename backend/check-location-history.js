#!/usr/bin/env node

import pool from './database/db.js';

const checkLocationHistory = async () => {
  const client = await pool.connect();

  try {
    console.log('📊 Vérification de location_history...\n');

    // Vérifier les derniers enregistrements
    const result = await client.query(`
      SELECT
        id,
        equipment_id,
        client,
        date_debut,
        date_retour_reel,
        duree_jours_ouvres,
        prix_ht_jour,
        minimum_facturation_apply,
        minimum_facturation,
        ca_total_ht
      FROM location_history
      ORDER BY date_debut DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('❌ Aucun historique de location trouvé');
      return;
    }

    console.log(`📋 Derniers ${result.rows.length} enregistrements:\n`);

    for (const record of result.rows) {
      console.log(`ID: ${record.id}`);
      console.log(`  Équipement: ${record.equipment_id}`);
      console.log(`  Client: ${record.client}`);
      console.log(`  Dates: ${record.date_debut} → ${record.date_retour_reel}`);
      console.log(`  Durée: ${record.duree_jours_ouvres} jours`);
      console.log(`  Prix/jour: ${record.prix_ht_jour}€`);
      console.log(`  Min Facturation Appliqué: ${record.minimum_facturation_apply}`);
      console.log(`  Min Montant: ${record.minimum_facturation}€`);
      console.log(`  CA Total: ${record.ca_total_ht}€`);
      console.log();
    }

    // Stats
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN minimum_facturation_apply = true THEN 1 END) as avec_minimum,
        COUNT(CASE WHEN minimum_facturation_apply = false THEN 1 END) as sans_minimum
      FROM location_history
    `);

    console.log(`\n📈 Statistiques:`);
    console.log(`   Total historiques: ${stats.rows[0].total}`);
    console.log(`   Avec minimum: ${stats.rows[0].avec_minimum}`);
    console.log(`   Sans minimum: ${stats.rows[0].sans_minimum}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

checkLocationHistory().then(() => {
  process.exit(0);
});
