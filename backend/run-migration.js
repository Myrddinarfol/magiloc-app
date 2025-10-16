import dotenv from 'dotenv';
import fs from 'fs';
import pool from './database/db.js';

dotenv.config();

async function runMigration() {
  try {
    console.log('🚀 Exécution de la migration...');

    const migrationFile = './migrations/001_create_clients_spare_parts.sql';
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    // Exécuter chaque commande SQL
    const commands = sql.split(';').filter(cmd => cmd.trim());

    for (const command of commands) {
      if (command.trim()) {
        console.log(`📝 Exécution: ${command.substring(0, 50)}...`);
        await pool.query(command);
      }
    }

    console.log('✅ Migration réussie !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    process.exit(1);
  }
}

runMigration();
