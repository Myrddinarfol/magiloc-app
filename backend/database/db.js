/**
 * Configuration PostgreSQL ultra-simple pour Render
 * FIX: Limite connexions pour plan gratuit Render (max 95)
 */

import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

// Configuration simple avec connectionString directe
let poolConfig;

if (process.env.DATABASE_URL) {
  // Utiliser directement la connectionString au lieu de parser
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Configuration optimisée pour Render
    max: 10,  // Augmenté pour free tier (limite Render: 97)
    min: 2,   // Garder 2 connexions minimum actives
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // Paramètres de stabilité
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Retry automatique
    application_name: 'magiloc_backend'
  };
} else {
  poolConfig = {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };
}

const pool = new Pool(poolConfig);

// Log simple au démarrage
console.log('🗄️  PostgreSQL Pool initialisé (max: 10 connexions)');
const dbUrl = process.env.DATABASE_URL || '';
const isLocalDb = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
console.log('📍 Mode:', isLocalDb ? 'LOCAL (localhost)' : 'DISTANT (Render/cloud)');

// Gestion améliorée des erreurs du pool
pool.on('error', (err) => {
  console.error('❌ Erreur pool PostgreSQL:', err.message);
  console.error('   Code erreur:', err.code);
  if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    console.log('🔄 Tentative de reconnexion...');
  }
});

pool.on('connect', () => {
  console.log('✅ Nouvelle connexion établie au pool');
});

// Test de connexion au démarrage
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Échec test connexion initial:', err.message);
  } else {
    console.log('✅ Connexion DB testée avec succès:', res.rows[0].now);
  }
});

export default pool;
