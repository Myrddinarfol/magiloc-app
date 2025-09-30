// Système de gestion des notes de mise à jour
// Pour ajouter une nouvelle version, ajoutez un objet au début du tableau

export const CURRENT_VERSION = '1.2.1';

export const releaseNotes = [
  {
    version: '1.2.1',
    date: '2025-10-01',
    title: 'Système de retry automatique pour le chargement',
    sections: [
      {
        title: '🔄 Robustesse de chargement',
        items: [
          'Système de retry intelligent : 12 tentatives sur 60 secondes',
          'Timeout de 10s par requête avec AbortController',
          'Messages de chargement dynamiques selon l\'étape',
          'Spinner animé avec effet pulse',
          'Info box explicative pour le cold start Render',
        ]
      },
      {
        title: '✨ Expérience utilisateur',
        items: [
          'Gestion automatique des serveurs en veille (Render free tier)',
          'Feedback visuel clair pendant le chargement',
          'Plus d\'erreurs de chargement intempestives',
          'Chargement fiable même après 15 min d\'inactivité',
        ]
      }
    ]
  },
  {
    version: '1.2.0',
    date: '2025-09-30',
    title: 'Améliorations majeures du PARC LOC et gestion VGP',
    sections: [
      {
        title: '✨ Nouvelles fonctionnalités',
        items: [
          'Filtres dynamiques dans PARC LOC (Désignation, CMU, Longueur)',
          'Recherche intelligente multi-champs (ex: "palan manuel 1t 10m")',
          'Gestion des certificats VGP avec liens VTIC automatiques',
          'Liens vers attestations Google Drive pour certificats internes',
          'Modal d\'ajout/modification de certificat avec aperçu en temps réel',
        ]
      },
      {
        title: '📊 Tableau PARC LOC optimisé',
        items: [
          'Nouvelle colonne "Longueur Chaîne/Câble"',
          'Nouvelle colonne "État" avec badges colorés (Bon, Moyen, Vieillissant, Neuf)',
          'Colonne "Prochain VGP" avec indicateurs visuels (🟢 OK, 🟠 < 1 mois, 🔴 Dépassé)',
          'Retrait des colonnes Client/Date (désormais dans En Location et En Offre)',
        ]
      },
      {
        title: '🎨 VGP dans les fiches détaillées',
        items: [
          'Indicateurs VGP ultra stylés avec animations (pulse, shake, bounce)',
          'Carte de statut avec dégradés et effets visuels',
          'Affichage du nombre de jours restants ou de retard',
          'Liens certificats cliquables en bleu',
          'Bouton "Ajouter/Modifier certificat" avec sauvegarde en base',
        ]
      },
      {
        title: '🔧 Améliorations techniques',
        items: [
          'API endpoint PATCH pour mise à jour des certificats',
          'Détection automatique des numéros CML pour génération d\'URL VTIC',
          'Optimisation de la recherche avec filtrage multi-mots',
          'Extraction automatique des valeurs uniques pour les filtres',
        ]
      }
    ]
  },
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
