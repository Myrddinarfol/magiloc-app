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

// Charger le fichier .env correspondant
let envFile = '.env.development'; // Par défaut
if (NODE_ENV === 'production') {
  envFile = '.env.production';
} else if (NODE_ENV === 'work') {
  envFile = '.env.work';
}

const envPath = path.join(__dirname, '..', '..', envFile);
dotenv.config({ path: envPath });

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

// 📊 Configuration de la base de données selon l'environnement
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// 🔌 Création du pool de connexion
const pool = new Pool(dbConfig);

// 📢 Affichage des informations de connexion au démarrage
console.log('\n' + colors.bright + colors.cyan + '═'.repeat(70) + colors.reset);
console.log(colors.bright + colors.cyan + '  🗄️  MAGILOC - CONFIGURATION BASE DE DONNÉES' + colors.reset);
console.log(colors.bright + colors.cyan + '═'.repeat(70) + colors.reset);

console.log(colors.bright + '\n  Environnement:' + colors.reset + ' ' +
  (NODE_ENV === 'production' ? colors.red + '🔴 PRODUCTION (Render)' :
   NODE_ENV === 'work' ? colors.yellow + '🟡 WORK (Local)' :
   colors.green + '🟢 DEVELOPMENT (Local)') + colors.reset);

console.log(colors.bright + '  Base de données:' + colors.reset + ' ' +
  colors.magenta + dbConfig.database + colors.reset);

console.log(colors.bright + '  Hôte:' + colors.reset + ' ' +
  colors.blue + dbConfig.host + ':' + dbConfig.port + colors.reset);

console.log(colors.bright + '  SSL:' + colors.reset + ' ' +
  (dbConfig.ssl ? colors.green + 'Activé ✓' : colors.yellow + 'Désactivé') + colors.reset);

console.log(colors.bright + '  Fichier config:' + colors.reset + ' ' +
  colors.cyan + envFile + colors.reset);

console.log(colors.bright + colors.cyan + '\n═'.repeat(70) + colors.reset + '\n');

// ⚡ Test de connexion au démarrage
pool.connect()
  .then(client => {
    console.log(colors.green + '✅ Connexion à la base de données établie avec succès !' + colors.reset + '\n');
    client.release();
  })
  .catch(err => {
    console.error(colors.red + '❌ Erreur de connexion à la base de données :' + colors.reset);
    console.error(colors.red + err.message + colors.reset + '\n');
  });

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
