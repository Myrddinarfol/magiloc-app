#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const net = require('net');

console.log('🚀 Démarrage de MagiLoc (Frontend + Backend)...\n');

// Vérifier si les ports sont libres
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function start() {
  // Vérifier les ports
  const port5000Free = await checkPort(5000);
  const port3000Free = await checkPort(3000);

  if (!port5000Free) {
    console.error('❌ ERREUR: Le port 5000 est déjà utilisé!');
    console.error('   Quelque chose d\'autre tourne déjà sur le port 5000.');
    console.error('   Solutions:');
    console.error('   1. Exécutez: cleanup-ports.bat');
    console.error('   2. Ou fermez l\'application qui occupe le port 5000');
    process.exit(1);
  }

  if (!port3000Free) {
    console.error('❌ ERREUR: Le port 3000 est déjà utilisé!');
    console.error('   Quelque chose d\'autre tourne déjà sur le port 3000.');
    console.error('   Solutions:');
    console.error('   1. Exécutez: cleanup-ports.bat');
    console.error('   2. Ou fermez l\'application qui occupe le port 3000');
    process.exit(1);
  }

  const isWindows = os.platform() === 'win32';
  const shell = isWindows ? 'cmd' : '/bin/bash';
  const shellArgs = isWindows ? ['/c'] : ['-c'];

  // Backend
  const backendDir = path.join(__dirname, 'backend');
  const backendCmd = isWindows
    ? `cd ${backendDir} && npm install && npm run dev`
    : `cd ${backendDir} && npm install && npm run dev`;

  // Frontend - Lancer depuis le répertoire frontend avec npm start
  const frontendDir = path.join(__dirname, 'frontend');
  const frontendCmd = isWindows
    ? `cd ${frontendDir} && npm install --legacy-peer-deps && set PORT=3000 && npm start`
    : `cd ${frontendDir} && npm install --legacy-peer-deps && PORT=3000 npm start`;

  console.log('✅ Ports libres - Lancement des serveurs\n');
  console.log('📦 Backend: npm run dev (port 5000)');
  console.log('🎨 Frontend: react-scripts start (port 3000)\n');

  const backend = spawn(shell, [...shellArgs, backendCmd], {
    stdio: 'inherit',
    shell: true
  });

  setTimeout(() => {
    console.log('\n⏳ Lancement du frontend...\n');
    const frontend = spawn(shell, [...shellArgs, frontendCmd], {
      stdio: 'inherit',
      shell: true
    });

    frontend.on('close', (code) => {
      console.log(`\n❌ Frontend fermé (code ${code})`);
      process.exit(code);
    });
  }, 4000);

  backend.on('close', (code) => {
    console.log(`\n❌ Backend fermé (code ${code})`);
    process.exit(code);
  });

  process.on('SIGINT', () => {
    console.log('\n\n🛑 Arrêt des serveurs...');
    backend.kill();
    process.exit(0);
  });
}

start().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
