#!/usr/bin/env node

/**
 * Analyse les divergences dans le CA d'Octobre 2025
 * Cherche les doublons, les NULL, les NaN, et les locations incohérentes
 */

import pool from './database/db.js';

const analyzeDiscrepancies = async () => {
  const client = await pool.connect();

  try {
    console.log('🔍 Analyse des divergences CA Octobre 2025\n');

    // 1. Chercher les DOUBLONS
    console.log('1️⃣  RECHERCHE DE DOUBLONS:\n');

    const doublonsResult = await client.query(`
      SELECT
        COUNT(*) as occurrences,
        equipment_id,
        date_debut,
        date_retour_reel,
        client
      FROM location_history
      WHERE date_debut >= '2025-10-01' AND date_retour_reel <= '2025-10-31'
      GROUP BY equipment_id, date_debut, date_retour_reel, client
      HAVING COUNT(*) > 1
      ORDER BY occurrences DESC
    `);

    if (doublonsResult.rows.length > 0) {
      console.log(`⚠️  DOUBLONS TROUVÉS: ${doublonsResult.rows.length}`);
      for (const row of doublonsResult.rows) {
        console.log(`   ${row.occurrences}x équip ${row.equipment_id} | ${row.date_debut} → ${row.date_retour_reel} | ${row.client}`);
      }
    } else {
      console.log('✅ Aucun doublon trouvé');
    }

    // 2. Chercher les valeurs NULL ou problématiques
    console.log('\n2️⃣  RECHERCHE DE VALEURS NULL/NaN:\n');

    const nullResult = await client.query(`
      SELECT COUNT(*) as count
      FROM location_history
      WHERE date_debut >= '2025-10-01' AND date_retour_reel <= '2025-10-31'
      AND (ca_total_ht IS NULL OR ca_total_ht = 0 OR ca_total_ht::text ~ '^[NaN]')
    `);

    console.log(`Locations avec CA = NULL/0/NaN: ${nullResult.rows[0].count}`);

    // 3. Récapitulatif octobre
    console.log('\n3️⃣  RÉCAPITULATIF OCTOBRE 2025:\n');

    const summaryResult = await client.query(`
      SELECT
        COUNT(*) as total_locations,
        COUNT(DISTINCT equipment_id) as distinct_equipment,
        SUM(CASE WHEN ca_total_ht IS NOT NULL THEN 1 ELSE 0 END) as with_ca,
        SUM(CASE WHEN minimum_facturation_apply = true THEN 1 ELSE 0 END) as with_minimum,
        SUM(CAST(ca_total_ht AS DECIMAL)) as total_ca,
        AVG(CAST(ca_total_ht AS DECIMAL)) as avg_ca,
        MIN(CAST(ca_total_ht AS DECIMAL)) as min_ca,
        MAX(CAST(ca_total_ht AS DECIMAL)) as max_ca
      FROM location_history
      WHERE date_debut >= '2025-10-01' AND date_retour_reel <= '2025-10-31'
    `);

    const summary = summaryResult.rows[0];
    console.log(`Total locations: ${summary.total_locations}`);
    console.log(`Équipements distincts: ${summary.distinct_equipment}`);
    console.log(`Locations avec CA: ${summary.with_ca}`);
    console.log(`Avec minimum appliqué: ${summary.with_minimum}`);
    console.log(`CA Total: ${summary.total_ca}€`);
    console.log(`CA Moyen: ${summary.avg_ca}€`);
    console.log(`CA Min: ${summary.min_ca}€`);
    console.log(`CA Max: ${summary.max_ca}€`);

    // 4. Détail par jour pour voir où sont les fuites
    console.log('\n4️⃣  CA PAR JOUR (28-31 OCT):\n');

    const dailyResult = await client.query(`
      SELECT
        date_retour_reel::date as return_date,
        COUNT(*) as location_count,
        SUM(CAST(ca_total_ht AS DECIMAL)) as daily_ca
      FROM location_history
      WHERE date_retour_reel >= '2025-10-28' AND date_retour_reel <= '2025-10-31'
      GROUP BY date_retour_reel::date
      ORDER BY date_retour_reel::date
    `);

    for (const row of dailyResult.rows) {
      console.log(`${row.return_date}: ${row.location_count} locations = ${row.daily_ca}€`);
    }

    // 5. Locations EN COURS qui dépassent fin théorique
    console.log('\n5️⃣  LOCATIONS EN COURS AVEC DÉPASSEMENT:\n');

    const ongoingResult = await client.query(`
      SELECT
        e.id,
        e.designation,
        e.client,
        e.debut_location,
        e.fin_location_theorique,
        e.statut,
        CASE WHEN e.fin_location_theorique < CURRENT_DATE THEN '⚠️  DÉPASSEMENT' ELSE 'OK' END as status,
        e.prix_ht_jour,
        e.minimum_facturation,
        e.minimum_facturation_apply
      FROM equipments e
      WHERE e.statut = 'En Location'
      AND e.debut_location >= '2025-10-01'
      ORDER BY e.fin_location_theorique DESC
      LIMIT 10
    `);

    if (ongoingResult.rows.length > 0) {
      for (const eq of ongoingResult.rows) {
        console.log(`${eq.status} | Équip ${eq.id}: ${eq.designation} | ${eq.debut_location} → ${eq.fin_location_theorique}`);
        console.log(`  Client: ${eq.client}, Prix: ${eq.prix_ht_jour}€/j, Min: ${eq.minimum_facturation}€ (appliqué: ${eq.minimum_facturation_apply})`);
      }
    } else {
      console.log('Aucune location en cours au 31/10');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

analyzeDiscrepancies().then(() => {
  process.exit(0);
});
