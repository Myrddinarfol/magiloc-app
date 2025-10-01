// Système de gestion des notes de mise à jour
// Pour ajouter une nouvelle version, ajoutez un objet au début du tableau

export const CURRENT_VERSION = '0.7.1';

export const releaseNotes = [
  {
    version: '0.7.1',
    date: '2025-10-01',
    title: 'Import complet des données de location',
    sections: [
      {
        title: '📋 Import CSV amélioré',
        items: [
          'Import des données de location : Client, Début Location, Fin théorique',
          'Import du N° Offre et des Notes de location',
          'Import du Motif de maintenance',
          'Affichage complet dans les fiches détail',
          'Support des variantes de noms de colonnes (majuscules/minuscules)',
        ]
      },
      {
        title: '🗄️ Base de données enrichie',
        items: [
          'Ajout des colonnes de location dans la table equipments',
          'Migration automatique de la base de données',
          'Données persistantes entre les sessions',
        ]
      }
    ]
  },
  {
    version: '0.7.0',
    date: '2025-10-01',
    title: 'Nouvelle page SUR PARC et refonte visuelle de la sidebar',
    sections: [
      {
        title: '🏢 Nouvelle page SUR PARC',
        items: [
          'Nouvel onglet "SUR PARC" affichant uniquement le matériel disponible',
          'Filtres intelligents : Désignation, CMU, Longueur',
          'Recherche multi-champs sur tous les critères',
          'Colonnes Longueur, État et Prochain VGP',
          'Compteur dynamique du matériel disponible',
        ]
      },
      {
        title: '🎨 Refonte visuelle complète de la sidebar',
        items: [
          'Fond gris foncé moderne (#0f0f0f) au lieu du rouge',
          'Boutons avec dégradés rouges et bordures marquées',
          'Liseré rouge lumineux diffus entre sidebar et contenu principal',
          'Titre "MagiLoc" avec dégradé rouge et effet brillant',
          'Badges rouges avec ombres et effets de profondeur',
          'Animations fluides sur hover avec barre latérale rouge',
        ]
      },
      {
        title: '🔄 Réorganisation de la navigation',
        items: [
          'Tous les titres d\'onglets en MAJUSCULES',
          'Nouvel ordre : TABLEAU DE BORD → SUR PARC → OFFRE DE PRIX → LOCATION → MAINTENANCE → PLANNING → PARC LOC → NOTES MAJ',
          'Structure moderne avec icône + texte + badge',
        ]
      },
      {
        title: '🎯 Amélioration du code couleur',
        items: [
          'Statut "En Location" en bleu (#3b82f6) au lieu de rouge',
          'Section dashboard "En Location" également en bleu',
          'Meilleure distinction visuelle entre les différents statuts',
        ]
      }
    ]
  },
  {
    version: '0.6.1',
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
    version: '0.6.0',
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
    version: '0.5.0',
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
    version: '0.1.0',
    date: '2025-09-28',
    title: 'MagiLoc v0.1 - Version initiale Alpha',
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
