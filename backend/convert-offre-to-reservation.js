import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://magiloc_mt5o_user:a7MM7PCbSCHNI68t3iCpu0X6XvJMcdxu@dpg-d3j5ujemcj7s739n4540-a.frankfurt-postgres.render.com/magiloc_mt5o";

async function convertStatuts() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔗 Connecté à PostgreSQL Render');

    // 1. Vérifier combien d'équipements ont "Offre de Prix" ou "En Offre"
    const checkResult = await client.query(`
      SELECT statut, COUNT(*) as count
      FROM equipments
      WHERE statut ILIKE '%offre%'
      GROUP BY statut;
    `);

    console.log('\n📊 Statuts contenant "offre" trouvés:');
    checkResult.rows.forEach(row => {
      console.log(`  - "${row.statut}": ${row.count} équipements`);
    });

    // 2. Convertir tous les statuts "Offre de Prix" et variantes vers "En Réservation"
    console.log('\n🔄 Conversion des statuts...');
    const updateResult = await client.query(`
      UPDATE equipments
      SET statut = 'En Réservation'
      WHERE statut ILIKE '%offre%'
      RETURNING id, numero_serie, statut;
    `);

    console.log(`✅ ${updateResult.rowCount} équipements convertis en "En Réservation"`);

    if (updateResult.rowCount > 0) {
      console.log('\n📋 Exemples convertis:');
      updateResult.rows.slice(0, 5).forEach(row => {
        console.log(`  - ID ${row.id} (${row.numero_serie}): ${row.statut}`);
      });
    }

    // 3. Vérification finale
    const finalCheck = await client.query(`
      SELECT statut, COUNT(*) as count
      FROM equipments
      GROUP BY statut
      ORDER BY statut;
    `);

    console.log('\n✅ Distribution finale des statuts:');
    finalCheck.rows.forEach(row => {
      console.log(`  - ${row.statut}: ${row.count} équipements`);
    });

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

convertStatuts().catch(err => {
  console.error('💥 Échec:', err);
  process.exit(1);
});
