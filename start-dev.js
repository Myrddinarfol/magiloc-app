#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Démarrage de MagiLoc (Frontend + Backend)...\n');

const isWindows = os.platform() === 'win32';
const shell = isWindows ? 'cmd' : '/bin/bash';
const shellArgs = isWindows ? ['/c'] : ['-c'];

// Backend
const backendDir = path.join(__dirname, 'backend');
const backendCmd = isWindows
  ? `cd ${backendDir} && npm install && npm run dev`
  : `cd ${backendDir} && npm install && npm run dev`;

// Frontend
const frontendDir = path.join(__dirname, 'frontend');
const frontendCmd = isWindows
  ? `cd ${frontendDir} && npm install --legacy-peer-deps && npm start`
  : `cd ${frontendDir} && npm install --legacy-peer-deps && npm start`;

console.log('📦 Backend: npm run dev');
console.log('🎨 Frontend: npm start\n');

const backend = spawn(shell, [...shellArgs, backendCmd], {
  stdio: 'inherit',
  shell: true
});

setTimeout(() => {
  const frontend = spawn(shell, [...shellArgs, frontendCmd], {
    stdio: 'inherit',
    shell: true
  });

  frontend.on('close', (code) => {
    console.log(`\n❌ Frontend fermé (code ${code})`);
    process.exit(code);
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`\n❌ Backend fermé (code ${code})`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Arrêt des serveurs...');
  backend.kill();
  process.exit(0);
});
