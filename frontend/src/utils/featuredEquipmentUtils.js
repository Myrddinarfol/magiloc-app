/**
 * Utilitaires pour les matériels phares
 */

export const calculateRentalFrequency = (equipmentData, periodDays) => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  // Compter les locations par modèle
  const rentalCounts = {};

  equipmentData.forEach(eq => {
    if (!eq.modele) return;

    const modele = eq.modele.toUpperCase().trim();

    // Compter si l'équipement a été loué dans la période
    if (eq.debutLocation) {
      const locationStart = new Date(eq.debutLocation);
      if (locationStart >= cutoffDate) {
        rentalCounts[modele] = (rentalCounts[modele] || 0) + 1;
      }
    }

    // Compter aussi les locations passées
    if (eq.rentreeLe) {
      const returnDate = new Date(eq.rentreeLe);
      if (returnDate >= cutoffDate) {
        rentalCounts[modele] = (rentalCounts[modele] || 0) + 1;
      }
    }
  });

  return rentalCounts;
};

export const getTopRentalModels = (equipmentData, periodDays, limit = 8) => {
  const rentalCounts = calculateRentalFrequency(equipmentData, periodDays);

  // Obtenir les modèles uniques
  const uniqueModels = [...new Set(equipmentData.map(eq => eq.modele).filter(Boolean))];

  // Trier par fréquence de location
  const sorted = uniqueModels
    .map(modele => ({
      modele: modele.toUpperCase().trim(),
      count: rentalCounts[modele.toUpperCase().trim()] || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return sorted.map(item => item.modele);
};

export const getPeriodLabel = (days) => {
  const months = Math.round(days / 30);
  if (days === 30) return 'Dernier mois';
  if (days === 90) return '3 derniers mois';
  if (days === 180) return '6 derniers mois';
  if (days === 365) return 'Dernière année';
  return `Derniers ${days} jours`;
};

export const FEATURED_EQUIPMENT_PERIODS = [
  { label: 'Dernier mois', days: 30 },
  { label: '3 derniers mois', days: 90 },
  { label: '6 derniers mois', days: 180 },
  { label: 'Dernière année', days: 365 }
];

export const DEFAULT_FEATURED_MODELS = ['TR30S', 'TR50', 'TE3000', 'TE1600'];
