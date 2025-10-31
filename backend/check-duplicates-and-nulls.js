#!/usr/bin/env node

import pool from './database/db.js';

const check = async () => {
  const client = await pool.connect();

  try {
    // Locations EN COURS
    console.log('LOCATIONS EN COURS (Octobre):\n');
    const ongoing = await client.query(`
      SELECT id, designation, client, debut_location, fin_location_theorique, statut
      FROM equipments
      WHERE statut = 'En Location'
      AND debut_location >= '2025-10-01'
    `);

    for (const eq of ongoing.rows) {
      console.log(`Équip ${eq.id}: ${eq.designation} | Début: ${eq.debut_location} | Fin théo: ${eq.fin_location_theorique}`);
    }

    // Locations avec CA = 0 ou NULL
    console.log('\n\nLOCATIONS AVEC CA = 0 OU NULL:\n');
    const nullCA = await client.query(`
      SELECT id, equipment_id, client, date_debut, ca_total_ht, duree_jours_ouvres, prix_ht_jour
      FROM location_history
      WHERE (ca_total_ht IS NULL OR ca_total_ht = 0)
      AND date_debut >= '2025-10-01'
    `);

    if (nullCA.rows.length > 0) {
      for (const loc of nullCA.rows) {
        console.log(`ID ${loc.id} | Équip ${loc.equipment_id} | ${loc.date_debut} | ${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€/j = ${loc.ca_total_ht || 'NULL'}€`);
      }
    } else {
      console.log('Aucune');
    }

    // Afficher les 5 locations du 30 octobre en détail
    console.log('\n\nDÉTAIL DES LOCATIONS DU 30 OCTOBRE:\n');
    const oct30 = await client.query(`
      SELECT
        id, equipment_id, client, date_debut, date_retour_reel,
        duree_jours_ouvres, prix_ht_jour, minimum_facturation_apply,
        minimum_facturation, ca_total_ht
      FROM location_history
      WHERE date_retour_reel::date = '2025-10-30'
    `);

    for (const loc of oct30.rows) {
      console.log(`ID ${loc.id} | Équip ${loc.equipment_id}`);
      console.log(`  Client: ${loc.client}`);
      console.log(`  Dates: ${loc.date_debut} → ${loc.date_retour_reel}`);
      console.log(`  Durée: ${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€ = ${loc.duree_jours_ouvres * loc.prix_ht_jour}€`);
      console.log(`  Min: ${loc.minimum_facturation_apply ? 'OUI' : 'NON'} (${loc.minimum_facturation}€)`);
      console.log(`  CA EN BDD: ${loc.ca_total_ht}€`);
      console.log();
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

check().then(() => process.exit(0));
