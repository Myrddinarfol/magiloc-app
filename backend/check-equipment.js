#!/usr/bin/env node

import pool from './database/db.js';

const checkEquipment = async () => {
  const client = await pool.connect();

  try {
    console.log('🔍 Vérification des équipements avec minimum de facturation...\n');

    // Chercher l'équipement 37 (TE1600)
    const result = await client.query(`
      SELECT
        id,
        designation,
        cmu,
        numero_serie,
        prix_ht_jour,
        minimum_facturation,
        minimum_facturation_apply,
        statut,
        client
      FROM equipments
      WHERE id = 37 OR numero_serie = 'TE1600'
      ORDER BY id
    `);

    if (result.rows.length === 0) {
      console.log('❌ Équipement 37 / TE1600 non trouvé');
      return;
    }

    console.log(`📋 Équipement trouvé:\n`);

    for (const eq of result.rows) {
      console.log(`ID: ${eq.id}`);
      console.log(`  Désignation: ${eq.designation} ${eq.cmu}`);
      console.log(`  N° Série: ${eq.numero_serie}`);
      console.log(`  Statut: ${eq.statut}`);
      console.log(`  Client: ${eq.client}`);
      console.log(`  Prix/jour: ${eq.prix_ht_jour}€`);
      console.log(`  Minimum Facturation: ${eq.minimum_facturation}€`);
      console.log(`  Minimum Appliqué: ${eq.minimum_facturation_apply}`);
      console.log();
    }

    // Stats sur tous les équipements avec minimum
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN minimum_facturation_apply = true THEN 1 END) as avec_minimum,
        COUNT(CASE WHEN minimum_facturation > 0 THEN 1 END) as avec_minimum_montant
      FROM equipments
    `);

    console.log(`\n📈 Statistiques équipements:`);
    console.log(`   Total équipements: ${stats.rows[0].total}`);
    console.log(`   Avec minimum appliqué: ${stats.rows[0].avec_minimum}`);
    console.log(`   Avec minimum montant: ${stats.rows[0].avec_minimum_montant}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

checkEquipment().then(() => {
  process.exit(0);
});
