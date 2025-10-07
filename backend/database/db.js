/**
 * Configuration PostgreSQL ultra-simple pour Render
 * FIX: Limite connexions pour plan gratuit Render (max 95)
 */

import pg from "pg";
const { Pool } = pg;

// Configuration pool adaptée aux limites Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  // IMPORTANT: Limiter connexions pour plan gratuit Render
  max: 5, // Max 5 connexions (Render gratuit limite à 95 total)
  min: 0, // Pas de connexion maintenue
  idleTimeoutMillis: 10000, // Fermer après 10s inactivité
  connectionTimeoutMillis: 5000 // Timeout connexion 5s
});

// Log simple au démarrage
console.log('🗄️  PostgreSQL Pool initialisé (max: 5 connexions)');
console.log('📍 Mode:', process.env.DATABASE_URL ? 'PRODUCTION (Render)' : 'LOCAL');

// Gestion des erreurs du pool
pool.on('error', (err) => {
  console.error('❌ Erreur pool PostgreSQL:', err.message);
});

export default pool;
