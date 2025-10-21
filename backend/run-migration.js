import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pool from './database/db.js';

dotenv.config();

async function runAllMigrations() {
  try {
    console.log('🚀 Exécution de toutes les migrations...');

    const migrationsDir = './migrations';
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`\n📝 Exécution migration: ${file}`);

      // Exécuter chaque commande SQL
      const commands = sql.split(';').filter(cmd => cmd.trim());

      for (const command of commands) {
        if (command.trim()) {
          try {
            await pool.query(command);
            console.log(`  ✓ ${command.substring(0, 60).replace(/\n/g, ' ')}...`);
          } catch (err) {
            // Si c'est une erreur "already exists", on ignore
            if (err.message.includes('already exists') || err.message.includes('does not exist')) {
              console.log(`  ⚠️  ${err.message.split('\n')[0]}`);
            } else {
              throw err;
            }
          }
        }
      }
    }

    console.log('\n✅ Toutes les migrations exécutées !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
    process.exit(1);
  }
}

runAllMigrations();
