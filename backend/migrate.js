// Point d'entrée pour les migrations
import('./run-migration.js').catch(err => {
  console.error('❌ Erreur lors de l\'exécution des migrations:', err);
  process.exit(1);
});
