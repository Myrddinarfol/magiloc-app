// Système de gestion des notes de mise à jour
// Pour ajouter une nouvelle version, ajoutez un objet au début du tableau

export const CURRENT_VERSION = '1.1.0';

export const releaseNotes = [
  {
    version: '1.1.0',
    date: '2025-09-30',
    title: 'Historique des mises à jour',
    sections: [
      {
        title: '✨ Nouvelles fonctionnalités',
        items: [
          'Système de versioning automatique',
          'Historique complet des mises à jour accessible via "Notes MAJ"',
          'Détection automatique des nouvelles versions',
        ]
      },
      {
        title: '🎨 Interface',
        items: [
          'Nouveau bouton "Notes MAJ" dans la sidebar',
          'Modal d\'historique avec toutes les versions',
        ]
      }
    ]
  },
  {
    version: '1.0.0',
    date: '2025-09-28',
    title: 'MagiLoc v1.0 - Version initiale',
    sections: [
      {
        title: '✨ Nouvelles fonctionnalités',
        items: [
          'Import CSV automatique pour votre parc existant',
          'Tableau de bord avec statistiques en temps réel',
          'Gestion complète des équipements par statut',
          'Recherche avancée multi-critères',
          'Base de données PostgreSQL centralisée',
        ]
      },
      {
        title: '🎨 Interface',
        items: [
          'Thème sombre moderne avec accents rouges',
          'Navigation intuitive par sidebar',
          'Interface responsive (PC, tablette, mobile)',
          'Fiches détaillées des équipements',
        ]
      },
      {
        title: '📊 Gestion des données',
        items: [
          'Synchronisation multi-utilisateurs',
          'Import CSV vers PostgreSQL',
          'Gestion des statuts : Sur Parc, En Location, Maintenance, Offre',
        ]
      },
      {
        title: '🔜 Prochainement',
        items: [
          'Processus de retour automatique',
          'Planning interactif des locations',
          'Gestion des workflows complets',
          'Export et rapports',
        ]
      }
    ]
  }
];

// Fonction helper pour obtenir les notes d'une version spécifique
export const getReleaseNotesByVersion = (version) => {
  return releaseNotes.find(note => note.version === version);
};

// Fonction helper pour vérifier si une nouvelle version est disponible
export const hasNewVersion = (lastSeenVersion) => {
  if (!lastSeenVersion) return true;
  return CURRENT_VERSION !== lastSeenVersion;
};
