import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const { Pool } = pg;

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 Chargement de la configuration d'environnement
const NODE_ENV = process.env.NODE_ENV || 'development';

// Sur Render, utiliser DATABASE_URL si présent (prioritaire)
const DATABASE_URL = process.env.DATABASE_URL;

let dbConfig;
let envFile = '';

if (DATABASE_URL) {
  // Render ou autre plateforme cloud avec DATABASE_URL
  dbConfig = {
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
      requestCert: false,
      // Force TLS v1.2 minimum
      minVersion: 'TLSv1.2'
    },
    // Configuration pour éviter les déconnexions
    max: 20, // Nombre max de clients dans le pool
    min: 2, // Garder minimum 2 connexions ouvertes
    idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30s
    connectionTimeoutMillis: 10000, // Timeout pour établir une connexion
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Retry automatique
    application_name: 'magiloc_backend'
  };
  envFile = 'DATABASE_URL (Render)';
} else {
  // Développement local : charger le fichier .env correspondant
  envFile = '.env.development'; // Par défaut
  if (NODE_ENV === 'production') {
    envFile = '.env.production';
  } else if (NODE_ENV === 'work') {
    envFile = '.env.work';
  }

  const envPath = path.join(__dirname, '..', '..', envFile);
  dotenv.config({ path: envPath });

  dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Configuration pour éviter les déconnexions
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  };
}

// 🎨 Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// 🔌 Création du pool de connexion
const pool = new Pool(dbConfig);

// Gestion des erreurs du pool
pool.on('error', (err, client) => {
  console.error(colors.red + '❌ Erreur inattendue sur le client du pool:' + colors.reset);
  console.error(colors.red + err.message + colors.reset);
});

pool.on('connect', () => {
  console.log(colors.green + '🔗 Nouvelle connexion établie dans le pool' + colors.reset);
});

pool.on('remove', () => {
  console.log(colors.yellow + '🔌 Connexion retirée du pool' + colors.reset);
});

// 📢 Affichage des informations de connexion au démarrage
console.log('\n' + colors.bright + colors.cyan + '═'.repeat(70) + colors.reset);
console.log(colors.bright + colors.cyan + '  🗄️  MAGILOC - CONFIGURATION BASE DE DONNÉES' + colors.reset);
console.log(colors.bright + colors.cyan + '═'.repeat(70) + colors.reset);

console.log(colors.bright + '\n  Environnement:' + colors.reset + ' ' +
  (DATABASE_URL ? colors.red + '🔴 PRODUCTION (Render)' :
   NODE_ENV === 'work' ? colors.yellow + '🟡 WORK (Local)' :
   colors.green + '🟢 DEVELOPMENT (Local)') + colors.reset);

if (DATABASE_URL) {
  // Affichage pour Render (masquer le mot de passe)
  const urlObj = new URL(DATABASE_URL);
  console.log(colors.bright + '  Base de données:' + colors.reset + ' ' +
    colors.magenta + urlObj.pathname.slice(1) + colors.reset);
  console.log(colors.bright + '  Hôte:' + colors.reset + ' ' +
    colors.blue + urlObj.hostname + colors.reset);
} else {
  // Affichage pour développement local
  console.log(colors.bright + '  Base de données:' + colors.reset + ' ' +
    colors.magenta + dbConfig.database + colors.reset);
  console.log(colors.bright + '  Hôte:' + colors.reset + ' ' +
    colors.blue + dbConfig.host + ':' + dbConfig.port + colors.reset);
}

console.log(colors.bright + '  SSL:' + colors.reset + ' ' +
  (dbConfig.ssl ? colors.green + 'Activé ✓' : colors.yellow + 'Désactivé') + colors.reset);

console.log(colors.bright + '  Config source:' + colors.reset + ' ' +
  colors.cyan + envFile + colors.reset);

console.log(colors.bright + colors.cyan + '\n═'.repeat(70) + colors.reset + '\n');

// ⚡ Test de connexion au démarrage
(async () => {
  let client;
  try {
    console.log(colors.cyan + '🔍 Test de connexion à la base de données...' + colors.reset);
    client = await pool.connect();
    console.log(colors.green + '✅ Connexion établie avec succès !' + colors.reset);

    // Test d'une requête simple
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log(colors.green + '✅ Requête test réussie:' + colors.reset);
    console.log(colors.cyan + '   Heure serveur: ' + result.rows[0].current_time + colors.reset);
    console.log(colors.cyan + '   Version PostgreSQL: ' + result.rows[0].pg_version.split(' ')[0] + colors.reset + '\n');

    client.release();
  } catch (err) {
    console.error(colors.red + '❌ Erreur de connexion à la base de données :' + colors.reset);
    console.error(colors.red + '   Message: ' + err.message + colors.reset);
    console.error(colors.red + '   Code: ' + err.code + colors.reset);
    console.error(colors.red + '   Stack: ' + err.stack + colors.reset + '\n');
    if (client) client.release();
  }
})();

// Fonction pour exécuter le schema.sql
export async function initDb() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log(colors.green + "✅ Base de données initialisée avec succès !" + colors.reset);
  } catch (err) {
    console.error(colors.red + "❌ Erreur lors de l'initialisation de la base :" + colors.reset, err);
  }
}

export default pool;
