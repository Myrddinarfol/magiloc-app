import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

console.log('🔍 Test de connexion PostgreSQL...\n');

// Configuration identique à db.js
const url = new URL(process.env.DATABASE_URL);
const poolConfig = {
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: url.port || 5432,  // Port par défaut PostgreSQL
  database: url.pathname.split('/')[1],
  ssl: { rejectUnauthorized: false },
  max: 5,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000
};

const pool = new Pool(poolConfig);

// Ajouter listener pour erreurs de connexion
pool.on('error', (err, client) => {
  console.error('❌ Erreur pool inattendue:', err.message);
  console.error('   Stack:', err.stack);
});

pool.on('connect', (client) => {
  console.log('✅ Event: Client connecté au pool');
});

pool.on('acquire', (client) => {
  console.log('✅ Event: Client acquis du pool');
});

pool.on('remove', (client) => {
  console.log('⚠️  Event: Client retiré du pool');
});

async function testConnection() {
  let client;
  try {
    console.log('📡 Tentative de connexion...');
    console.log('📍 Host:', poolConfig.host);
    console.log('📍 Port:', poolConfig.port);
    console.log('📍 Database:', poolConfig.database);
    console.log('📍 User:', poolConfig.user);
    console.log('📍 SSL:', poolConfig.ssl ? 'Activé' : 'Désactivé');

    client = await pool.connect();
    console.log('✅ Connexion établie avec succès!\n');

    // Test simple query
    console.log('🔍 Test SELECT 1...');
    const result = await client.query('SELECT 1 as test');
    console.log('✅ SELECT 1 réussi:', result.rows[0]);

    // Test table equipments
    console.log('\n🔍 Test COUNT(*) sur table equipments...');
    const countResult = await client.query('SELECT COUNT(*) FROM equipments');
    console.log('✅ Nombre d\'équipements:', countResult.rows[0].count);

    // Test colonnes de la table
    console.log('\n🔍 Vérification colonnes table equipments...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'equipments'
      ORDER BY ordinal_position
    `);
    console.log('✅ Colonnes disponibles:');
    columnsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ Tous les tests réussis!');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('❌ Code:', error.code);
    console.error('❌ Detail:', error.detail);
  } finally {
    if (client) {
      client.release();
      console.log('\n🔄 Client relâché');
    }
    await pool.end();
    console.log('🔄 Pool fermé');
    process.exit(0);
  }
}

testConnection();
