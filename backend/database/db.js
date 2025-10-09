/**
 * Configuration PostgreSQL ultra-simple pour Render
 * FIX: Limite connexions pour plan gratuit Render (max 95)
 */

import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

// Parse l'URL de connexion pour éviter les problèmes Windows
let poolConfig;

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  poolConfig = {
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: url.port,
    database: url.pathname.split('/')[1],
    ssl: { rejectUnauthorized: false },
    // IMPORTANT: Limiter connexions pour plan gratuit Render
    max: 5,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  };
} else {
  poolConfig = {
    max: 5,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
  };
}

const pool = new Pool(poolConfig);

// Log simple au démarrage
console.log('🗄️  PostgreSQL Pool initialisé (max: 5 connexions)');
console.log('📍 Mode:', process.env.DATABASE_URL ? 'PRODUCTION (Render)' : 'LOCAL');

// Gestion des erreurs du pool
pool.on('error', (err) => {
  console.error('❌ Erreur pool PostgreSQL:', err.message);
});

export default pool;
