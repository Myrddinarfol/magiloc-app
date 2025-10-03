// Fonctions pour obtenir les classes CSS de statut et d'état

export const getStatusClass = (status) => {
  switch (status) {
    case 'Sur Parc': return 'status-sur-parc';
    case 'En Location': return 'status-en-location';
    case 'En Maintenance': return 'status-en-maintenance';
    case 'En Réservation': return 'status-en-offre';
    default: return '';
  }
};

export const getEtatClass = (etat) => {
  switch (etat) {
    case 'Bon': return 'etat-bon';
    case 'Moyen': return 'etat-moyen';
    case 'Vieillissant': return 'etat-vieillissant';
    case 'Neuf': return 'etat-neuf';
    default: return '';
  }
};
