#!/usr/bin/env node

import pool from './database/db.js';

const cleanup = async () => {
  const client = await pool.connect();

  try {
    console.log('🧹 Nettoyage des doublons TEST...\n');

    // Supprimer les doublons équip 1 avec CLIENT TEST
    const result = await client.query(`
      DELETE FROM location_history
      WHERE equipment_id = 1
      AND client = 'CLIENT TEST'
      AND date_debut >= '2025-10-01'
      AND date_debut <= '2025-10-31'
    `);

    console.log(`✅ ${result.rowCount} entrées supprimées`);

    // Vérifier qu'il ne reste rien
    const check = await client.query(`
      SELECT COUNT(*) as count
      FROM location_history
      WHERE equipment_id = 1
      AND client = 'CLIENT TEST'
    `);

    console.log(`\n📊 Vérification: ${check.rows[0].count} entrées TEST restantes`);

    if (check.rows[0].count === 0) {
      console.log('✅ Nettoyage réussi!');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

cleanup().then(() => process.exit(0));
