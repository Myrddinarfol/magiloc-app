import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import readline from "readline";

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

const envPath = path.join(__dirname, '..', envFile);
dotenv.config({ path: envPath });

// 🎨 Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// 🔐 Protection PRODUCTION
if (NODE_ENV === 'production') {
  console.log(colors.red + colors.bright + '\n❌ ERREUR: Impossible de réinitialiser la base de données PRODUCTION !' + colors.reset);
  console.log(colors.yellow + '⚠️  Pour des raisons de sécurité, cette opération est bloquée en production.' + colors.reset);
  console.log(colors.cyan + 'ℹ️  Utilisez NODE_ENV=development ou NODE_ENV=work pour réinitialiser une base locale.\n' + colors.reset);
  process.exit(1);
}

// 📊 Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Fonction pour poser une question à l'utilisateur
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

// Fonction principale de réinitialisation
async function resetDatabase() {
  console.log('\n' + colors.bright + colors.cyan + '═'.repeat(70) + colors.reset);
  console.log(colors.bright + colors.cyan + '  🔄 MAGILOC - RÉINITIALISATION BASE DE DONNÉES' + colors.reset);
  console.log(colors.bright + colors.cyan + '═'.repeat(70) + colors.reset);

  console.log(colors.bright + '\n  Environnement:' + colors.reset + ' ' +
    (NODE_ENV === 'work' ? colors.yellow + '🟡 WORK (Local)' : colors.green + '🟢 DEVELOPMENT (Local)') + colors.reset);
  console.log(colors.bright + '  Base de données:' + colors.reset + ' ' + colors.red + dbConfig.database + colors.reset);
  console.log(colors.bright + '  Hôte:' + colors.reset + ' ' + colors.blue + dbConfig.host + ':' + dbConfig.port + colors.reset);

  console.log(colors.bright + colors.red + '\n⚠️  ATTENTION: Cette opération va SUPPRIMER toutes les données !' + colors.reset);
  console.log(colors.yellow + '   - Toutes les tables seront recréées' + colors.reset);
  console.log(colors.yellow + '   - Toutes les données seront perdues' + colors.reset);
  console.log(colors.yellow + '   - Cette action est IRRÉVERSIBLE\n' + colors.reset);

  const answer = await askQuestion(colors.bright + 'Voulez-vous vraiment continuer ? (tapez "OUI" pour confirmer) : ' + colors.reset);

  if (answer.trim().toUpperCase() !== 'OUI') {
    console.log(colors.yellow + '\n✋ Opération annulée par l\'utilisateur.\n' + colors.reset);
    process.exit(0);
  }

  const pool = new Pool(dbConfig);

  try {
    console.log(colors.cyan + '\n🔌 Connexion à la base de données...' + colors.reset);
    await pool.connect();

    // Suppression de toutes les tables
    console.log(colors.cyan + '🗑️  Suppression des tables existantes...' + colors.reset);
    await pool.query(`
      DROP TABLE IF EXISTS maintenance_history CASCADE;
      DROP TABLE IF EXISTS location_history CASCADE;
      DROP TABLE IF EXISTS locations CASCADE;
      DROP TABLE IF EXISTS equipments CASCADE;
    `);
    console.log(colors.green + '✓ Tables supprimées' + colors.reset);

    // Lecture et exécution du schéma
    console.log(colors.cyan + '📜 Chargement du schéma...' + colors.reset);
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log(colors.cyan + '🏗️  Création des tables...' + colors.reset);
    await pool.query(schema);
    console.log(colors.green + '✓ Tables créées avec succès' + colors.reset);

    // Vérification
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(colors.green + '\n✅ Base de données réinitialisée avec succès !' + colors.reset);
    console.log(colors.cyan + '\nTables créées:' + colors.reset);
    result.rows.forEach(row => {
      console.log(colors.blue + '  • ' + row.table_name + colors.reset);
    });

    console.log(colors.bright + colors.cyan + '\n═'.repeat(70) + colors.reset + '\n');

  } catch (err) {
    console.error(colors.red + '\n❌ Erreur lors de la réinitialisation:' + colors.reset);
    console.error(colors.red + err.message + colors.reset + '\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécution
resetDatabase();
