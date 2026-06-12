#!/usr/bin/env node
// Corrige le statut legacy 'Réservation' → 'En Réservation'
// (même UPDATE que la migration 019, pour application immédiate sans redémarrage)

import pool from './database/db.js';

const fix = async () => {
  try {
    const before = await pool.query(
      `SELECT id, designation, cmu, client FROM equipments WHERE statut = 'Réservation'`
    );
    console.log(`🔍 ${before.rows.length} équipement(s) avec statut 'Réservation':`);
    before.rows.forEach(r => console.log(`   #${r.id} ${r.designation} ${r.cmu || ''} (${r.client || 'sans client'})`));

    const result = await pool.query(
      `UPDATE equipments SET statut = 'En Réservation' WHERE statut = 'Réservation'`
    );
    console.log(`✅ ${result.rowCount} statut(s) corrigé(s) en 'En Réservation'`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

fix();
