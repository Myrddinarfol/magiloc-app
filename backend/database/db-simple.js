/**
 * Configuration PostgreSQL ultra-simple pour Render
 * Version simplifiée sans complexité inutile
 */

import pg from "pg";
const { Pool } = pg;

// Utiliser DATABASE_URL de Render (déjà configuré sur le dashboard)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Log simple au démarrage
console.log('🗄️  PostgreSQL Pool initialisé');
console.log('📍 Mode:', process.env.DATABASE_URL ? 'PRODUCTION (Render)' : 'LOCAL');

// Gestion des erreurs du pool
pool.on('error', (err) => {
  console.error('❌ Erreur pool PostgreSQL:', err.message);
});

export default pool;
