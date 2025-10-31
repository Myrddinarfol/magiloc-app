#!/usr/bin/env node

import pool from './database/db.js';

const check = async () => {
  const client = await pool.connect();

  try {
    // Chercher le PESON SDEL
    const res = await client.query(`
      SELECT
        id, designation, numero_serie, client, statut,
        debut_location, fin_location_theorique,
        prix_ht_jour, minimum_facturation, minimum_facturation_apply
      FROM equipments
      WHERE UPPER(designation) LIKE '%PESON%'
      AND UPPER(client) LIKE '%SDEL%'
    `);

    if (res.rows.length === 0) {
      console.log('❌ Aucun PESON SDEL trouvé');
      return;
    }

    const eq = res.rows[0];
    console.log(`\n📦 PESON SDEL - Équip ${eq.id}\n`);
    console.log(`Désignation: ${eq.designation}`);
    console.log(`N° Série: ${eq.numero_serie}`);
    console.log(`Client: ${eq.client}`);
    console.log(`Statut: ${eq.statut}`);
    console.log(`\nDates:`);
    console.log(`  Début: ${eq.debut_location}`);
    console.log(`  Fin théo: ${eq.fin_location_theorique}`);
    console.log(`\nTarification:`);
    console.log(`  Prix/jour: ${eq.prix_ht_jour}€`);
    console.log(`  Min Fact: ${eq.minimum_facturation}€`);
    console.log(`  Min Appliqué: ${eq.minimum_facturation_apply ? 'OUI' : 'NON'}`);

    // Récupérer l'historique
    console.log(`\n\nHISTORIQUE LOCATION:\n`);
    const hist = await client.query(`
      SELECT
        id, date_debut, date_retour_reel, duree_jours_ouvres,
        prix_ht_jour, minimum_facturation, minimum_facturation_apply,
        ca_total_ht
      FROM location_history
      WHERE equipment_id = $1
      ORDER BY date_debut DESC
      LIMIT 10
    `, [eq.id]);

    if (hist.rows.length === 0) {
      console.log('Pas d\'historique');
    } else {
      for (const loc of hist.rows) {
        const calculCA = loc.duree_jours_ouvres * loc.prix_ht_jour;
        console.log(`\nID ${loc.id} | ${loc.date_debut} → ${loc.date_retour_reel}`);
        console.log(`  Durée: ${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€/j = ${calculCA.toFixed(2)}€`);
        console.log(`  Min: ${loc.minimum_facturation_apply ? 'OUI (' + loc.minimum_facturation + '€)' : 'NON'}`);
        console.log(`  CA EN BDD: ${loc.ca_total_ht}€`);

        if (loc.minimum_facturation_apply && loc.ca_total_ht !== loc.minimum_facturation) {
          console.log(`  ⚠️  INCOHÉRENCE: CA devrait être ${loc.minimum_facturation}€!`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

check().then(() => process.exit(0));
