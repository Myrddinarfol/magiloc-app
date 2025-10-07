import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixStatuts() {
  const client = await pool.connect();

  try {
    console.log('\n🔧 === UNIFORMISATION DES STATUTS ===\n');

    // 1. Vérifier les statuts actuels
    console.log('📊 Analyse des statuts actuels...');
    const statuts = await client.query(`
      SELECT statut, COUNT(*) as count
      FROM equipments
      GROUP BY statut
      ORDER BY statut
    `);

    console.log('\nStatuts trouvés:');
    statuts.rows.forEach(row => {
      console.log(`  - "${row.statut}": ${row.count} équipement(s)`);
    });

    // 2. Uniformiser SUR PARC → Sur Parc
    console.log('\n🔄 Uniformisation "SUR PARC" → "Sur Parc"...');
    const resultSurParc = await client.query(`
      UPDATE equipments
      SET statut = 'Sur Parc'
      WHERE statut = 'SUR PARC' OR statut = 'sur parc' OR statut ILIKE 'sur%parc'
    `);
    console.log(`✅ ${resultSurParc.rowCount} équipement(s) mis à jour`);

    // 3. Uniformiser EN LOCATION → En Location
    console.log('\n🔄 Uniformisation variations "En Location"...');
    const resultLocation = await client.query(`
      UPDATE equipments
      SET statut = 'En Location'
      WHERE statut ILIKE 'en%location' AND statut != 'En Location'
    `);
    console.log(`✅ ${resultLocation.rowCount} équipement(s) mis à jour`);

    // 4. Uniformiser EN MAINTENANCE → En Maintenance
    console.log('\n🔄 Uniformisation variations "En Maintenance"...');
    const resultMaintenance = await client.query(`
      UPDATE equipments
      SET statut = 'En Maintenance'
      WHERE statut ILIKE 'en%maintenance' AND statut != 'En Maintenance'
    `);
    console.log(`✅ ${resultMaintenance.rowCount} équipement(s) mis à jour`);

    // 5. Uniformiser EN RÉSERVATION → En Réservation
    console.log('\n🔄 Uniformisation variations "En Réservation"...');
    const resultReservation = await client.query(`
      UPDATE equipments
      SET statut = 'En Réservation'
      WHERE (statut ILIKE 'en%offre%prix' OR statut ILIKE 'en%r_servation') AND statut != 'En Réservation'
    `);
    console.log(`✅ ${resultReservation.rowCount} équipement(s) mis à jour`);

    // 6. Afficher les statuts finaux
    console.log('\n📊 Statuts après uniformisation:');
    const finalStatuts = await client.query(`
      SELECT statut, COUNT(*) as count
      FROM equipments
      GROUP BY statut
      ORDER BY statut
    `);

    finalStatuts.rows.forEach(row => {
      console.log(`  - "${row.statut}": ${row.count} équipement(s)`);
    });

    // 7. Vérifier les statuts NULL ou vides
    const nullStatuts = await client.query(`
      SELECT id, designation, cmu
      FROM equipments
      WHERE statut IS NULL OR statut = ''
    `);

    if (nullStatuts.rowCount > 0) {
      console.log(`\n⚠️  ${nullStatuts.rowCount} équipement(s) sans statut:`);
      nullStatuts.rows.forEach(row => {
        console.log(`  - ID ${row.id}: ${row.designation} ${row.cmu}`);
      });
      console.log('\n🔄 Attribution du statut "Sur Parc" par défaut...');
      await client.query(`
        UPDATE equipments
        SET statut = 'Sur Parc'
        WHERE statut IS NULL OR statut = ''
      `);
      console.log('✅ Statuts par défaut attribués');
    } else {
      console.log('\n✅ Aucun équipement sans statut');
    }

    console.log('\n✅ === UNIFORMISATION TERMINÉE ===\n');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

fixStatuts();
