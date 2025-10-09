// Système de gestion des notes de mise à jour
// Pour ajouter une nouvelle version, ajoutez un objet au début du tableau

export const CURRENT_VERSION = '0.9.3';

export const releaseNotes = [
  {
    version: '0.9.3',
    date: '2025-10-09',
    title: '🎯 Visite Guidée Interactive + Panneaux WIP + UX Planning',
    sections: [
      {
        title: '🎯 Visite Guidée Interactive',
        items: [
          'Nouveau bouton "🎯 VISITE GUIDEE" dans la sidebar avec animation pulse',
          'Modal au premier login proposant de démarrer la visite guidée',
          '7 étapes guidées avec spotlight animé sur les éléments',
          'Navigation intuitive : Précédent, Suivant, Passer',
          'Barre de progression avec dots actifs',
          'Spotlight optimisé : bordure rouge→jaune, triple glow externe',
          'Tooltips intelligents qui se repositionnent automatiquement',
          'Mémorisation dans localStorage (ne s\'affiche qu\'une fois)',
        ]
      },
      {
        title: '🚧 Panneaux WIP Simplifiés',
        items: [
          'Nouveau composant WIPPanel pour signaler les sections en développement',
          'Message simple et clair : "Section en cours de développement"',
          'Design épuré avec icône 🚧 animée',
          'Intégré dans Dashboard Maintenance, Planning Maintenance et Analytics',
        ]
      },
      {
        title: '📅 Planning Location - Ligne "Aujourd\'hui"',
        items: [
          'Ligne verticale rouge "🕐 AUJOURD\'HUI" sur la timeline',
          'Position dynamique selon la date du jour',
          'Animation glow pulsante rouge→jaune',
          'Indicateur visuel en haut de la ligne',
        ]
      },
      {
        title: '🎨 Design & Animations',
        items: [
          '200+ lignes de CSS pour le système de visite guidée',
          'Spotlight avec box-shadow 9999px pour assombrir le reste',
          'Animations : pulse, bounce, float, glow',
          'Modal post-login avec effet bounce-in',
          'Z-index optimisé (tooltips à 100000)',
        ]
      },
      {
        title: '📂 Architecture',
        items: [
          'Nouveau fichier : GuidedTour.js (195 lignes)',
          'Nouveau fichier : WIPPanel.js (20 lignes)',
          'Intégration dans App.js pour gestion du tour',
          'Sidebar.js : bouton + composant tour',
          'LoginPage.js : modal choix visite guidée',
        ]
      }
    ]
  },
  {
    version: '0.9.2',
    date: '2025-10-09',
    title: '✨ Corrections & Améliorations Planning + Dashboard + UX',
    sections: [
      {
        title: '🗑️ Modal de suppression stylisé',
        items: [
          'Remplacement window.confirm par modal animé moderne',
          'Design cohérent avec thème visuel (dégradés, ombres, animations)',
          'Icône 🗑️ animée avec effet bounce',
          'Message clair avec avertissement "Action irréversible"',
          'Effets hover sur les boutons Annuler/Supprimer',
        ]
      },
      {
        title: '🔧 Fiches maintenance optimisées',
        items: [
          'Suppression du bouton doublon "Valider Maintenance"',
          'Bouton unique dans le Panneau de Contrôle (à droite)',
          'Panneau Gestion Maintenance affiche motif + notes de retour',
          'Interface plus claire et moins de confusion',
        ]
      },
      {
        title: '📊 Dashboard - Matériels phares corrigés',
        items: [
          'Fix comptage TR30S/LM300+ : inclut maintenant TR30 (sans S)',
          'Reconnaissance de "MINIFOR TR30" et "MINIFOR TR30S"',
          'Variantes ajoutées : "LM 300+" avec espace',
          'Même correction pour TR50, LM500+, TE3000, TE1600',
          'Comptage correct de TOUS les modèles peu importe le statut',
        ]
      },
      {
        title: '📦 Dashboard - Alertes rupture de stock',
        items: [
          'Filtre strict : affiche UNIQUEMENT les matériels à 0 sur parc',
          'Plus d\'alertes pour les matériels avec 1 disponible',
          'Tri par total décroissant (matériels les plus nombreux en premier)',
          'Texte mis à jour : "Matériels avec 0 disponible sur parc"',
        ]
      },
      {
        title: '🎯 Planning Location - Filtres dynamiques',
        items: [
          'Nouveaux boutons de filtre stylisés en haut du planning',
          '📋 Réservations (vert) - avec compteur',
          '🚚 Locations en cours (bleu) - avec compteur',
          '⚠️ Dépassements (orange) - avec compteur',
          'Activation/désactivation en temps réel',
          'Design cohérent avec dégradés et effets hover',
        ]
      },
      {
        title: '📅 Planning Location - Interface épurée',
        items: [
          'Suppression du panneau "Détails des Locations" en bas',
          'Planning plus épuré et focalisé sur la timeline',
          'Meilleure lisibilité de la visualisation',
          'Performance améliorée avec moins d\'éléments DOM',
        ]
      },
      {
        title: '🏷️ Sidebar - Badges Location mis à jour',
        items: [
          'Badge principal LOCATION : affiche total (Réservations + Locations)',
          'Badge sous-menu Réservation : nombre de réservations',
          'Badge sous-menu Locations en cours : nombre de locations',
          'Cohérence avec la logique métier',
        ]
      },
      {
        title: '🔧 Maintenance validée - Historique',
        items: [
          'Validation maintenance crée automatiquement l\'historique',
          'Enregistrement motif + notes + durée en jours',
          'Passage automatique du matériel en "Sur Parc"',
          'Réinitialisation des champs maintenance après validation',
          'Fix colonne duree_jours manquante dans maintenance_history',
        ]
      }
    ]
  },
  {
    version: '0.9.1',
    date: '2025-10-05',
    title: '🎨 Refonte UI Complète + Dashboard Redesign + Corrections Z-Index',
    sections: [
      {
        title: '🎨 Nouveau composant PageHeader unifié',
        items: [
          'Bandeau stylé avec icône animée, titre gradient et description',
          'Appliqué sur TOUS les onglets et sous-onglets',
          'Animations subtiles : slideInDown, iconPulse, headerShine',
          'Design sobre avec border rouge discrète (1px, opacity 0.3)',
          'Cohérence visuelle parfaite sur toute l\'application',
        ]
      },
      {
        title: '📊 Dashboard complètement redesigné',
        items: [
          '4 capsules d\'alertes intelligentes avec badges conditionnels',
          'Badge rond rouge (!) : alertes actives',
          'Badge rond orange (!) : VGP uniquement <30 jours',
          'Badge carré vert (✓) : tout est OK (0 alerte)',
          'Panneau "Ruptures de Stock" (matériels ≤1 disponible)',
          'Contours réduits et plus sobres (border 1px au lieu de 1.5px)',
          'Hauteur capsules statuts alignée avec matériels phares',
        ]
      },
      {
        title: '✨ Matériels phares avec animations premium',
        items: [
          'Animation float : flottement léger et élégant',
          'Effet shine : brillance qui traverse les capsules',
          'Icônes animées avec bounce + ombre portée',
          'Jauges avec effet brillant animé',
          'Gradients dynamiques et glow au hover',
          'Transform scale (1.02x) + translateY au survol',
        ]
      },
      {
        title: '🔧 Modal annulation réservation stylée',
        items: [
          'Remplacement window.confirm par modal moderne',
          'Backdrop blur avec icône ⚠️ animée',
          'Boutons avec effets hover et gradients',
          'Navigation corrigée : retour onglet RÉSERVATION',
          'Design cohérent avec reste de l\'application',
        ]
      },
      {
        title: '⚡ Corrections critiques z-index',
        items: [
          'Menu Paramètres TOUJOURS au premier plan (z-index: 9999999)',
          'Overlay modal plus opaque (85%) et flouté (12px)',
          'CSS isolation: isolate sur tous conteneurs principaux',
          'Hiérarchie clarifiée : Modal > Sidebar (10) > Contenu (1)',
          'Fix éléments animés qui passaient devant les modals',
        ]
      },
      {
        title: '📝 Améliorations UX',
        items: [
          'Filtres modèles phares auto-reset au changement de page',
          'Textes capsules alertes revus pour meilleure lisibilité',
          'EditTechInfoModal : conversion chaînes vides → null',
          'Fix uniformisation statuts "SUR PARC" → "Sur Parc"',
          'Effets d\'animation cohérents partout',
        ]
      },
      {
        title: '🔨 Architecture technique',
        items: [
          'Composant PageHeader.js + PageHeader.css réutilisables',
          'DashboardPage.css dédié pour isolation des styles',
          'Animations CSS optimisées : float, shine, bounce, pulse',
          'Contextes d\'empilement isolés avec isolation: isolate',
          'Structure composants améliorée et maintenable',
        ]
      }
    ]
  },
  {
    version: '0.9.0',
    date: '2025-10-05',
    title: '🔧 Gestion complète maintenance + Dates DD/MM/YYYY + Suppression',
    sections: [
      {
        title: '📅 Uniformisation format dates',
        items: [
          'Toutes les dates affichées au format français DD/MM/YYYY',
          'Conversion automatique backend entre format français et ISO',
          'Colonne "Date entrée" ajoutée dans liste maintenance',
          'Fonctions helpers : formatDateToFrench() et convertFrenchToISO()',
        ]
      },
      {
        title: '🔧 Workflow maintenance complet',
        items: [
          'Bouton "Mettre en Maintenance" pour matériels SUR PARC et PARC LOC',
          'Modal avec champ motif maintenance obligatoire',
          'Enregistrement date début maintenance automatique',
          'Bouton "Valider la Maintenance" dans fiches maintenance',
          'Retour automatique sur parc après validation',
        ]
      },
      {
        title: '📊 Historique maintenance automatique',
        items: [
          'Calcul automatique durée en jours',
          'Enregistrement motif + notes retour + durée',
          'Sauvegarde dates entrée/sortie',
          'Réinitialisation automatique champs après validation',
          'Table maintenance_history complètement exploitée',
        ]
      },
      {
        title: '🗑️ Suppression matériel',
        items: [
          'Bouton supprimer dans fiches PARC LOC',
          'Confirmation avec message sécurité',
          'Route DELETE backend avec gestion erreurs',
          'Toast notification succès/erreur',
        ]
      },
      {
        title: '✨ Interface optimisée',
        items: [
          'Boutons historiques en grille 2 colonnes alignés',
          'Boutons actions alignés selon contexte',
          'Modal CompleteMaintenanceModal avec récapitulatif',
          'Design cohérent dégradés orange (maintenance)',
        ]
      },
      {
        title: '🐛 Patches v0.9.0.1 → v0.9.0.6',
        items: [
          'v0.9.0.1: Fix notes de retour, dernier client, modal z-index, retards location',
          'v0.9.0.2: Fix validation maintenance sans date + Navigation intelligente',
          'v0.9.0.3: Fix statut "Sur Parc" (uniformisation majuscules)',
          'v0.9.0.4: Refonte navigation modals avec passage page cible explicite',
          'v0.9.0.5: Amélioration conversion dates (timestamps ISO, français, etc.)',
          'v0.9.0.6: Fix conflit variable "client" (PostgreSQL vs paramètre) + Logs détaillés',
        ]
      },
    ]
  },
  {
    version: '0.8.3',
    date: '2025-10-04',
    title: '🎨 Notifications toast + Filtres produits phares + Icônes harmonisées',
    sections: [
      {
        title: '🎉 Notifications toast stylées',
        items: [
          'Remplacement de tous les alert() par des notifications toast élégantes',
          'Position en haut à droite avec animations slide-in et fade-out',
          '4 types : Success (vert ✓), Error (rouge ✕), Warning (orange ⚠), Info (bleu ℹ)',
          'Auto-disparition après 4 secondes',
          'Support du thème clair/sombre',
          'Notifications pour toutes les actions : import CSV, ajout équipement, validation formulaires, etc.',
        ]
      },
      {
        title: '🔍 Filtre intelligent produits phares',
        items: [
          'Clic sur une capsule de produit phare (TR30S, TE3000, etc.) applique un filtre automatique',
          'Navigation vers "Sur Parc" avec filtrage par modèles',
          'Badge orange visible "🔍 Filtre: TR30S, LM300+" en haut de la liste',
          'Bouton "✕ Réinitialiser" pour supprimer le filtre',
          'Permet de voir rapidement la disponibilité des matériels phares',
        ]
      },
      {
        title: '✨ Harmonisation des icônes',
        items: [
          'Nouvelle cohérence visuelle dans toute l\'application',
          'Menu sidebar : 🏠 Dashboard, ✅ Sur Parc, 🚚 Location (conservé), 🔧 Maintenance (conservé)',
          'Sous-menus Location : 📋 Réservation (calepin), 📦 Locations en cours, 📅 Planning',
          'Sous-menus Maintenance : 📊 Dashboard, 🛠️ Matériels, 📆 Planning',
          'Dashboard : icônes cohérents avec la sidebar (🚚, 🔧, 📋)',
          'Suppression des doublons : chaque icône a un usage unique',
        ]
      },
    ]
  },
  {
    version: '0.8.2',
    date: '2025-10-03',
    title: '🎯 Réorganisation menu + Planning semaine + Fixes',
    sections: [
      {
        title: '🎨 Réorganisation menu sidebar',
        items: [
          'RÉSERVATION déplacé en 1er sous-menu de LOCATION',
          'ANALYTICS, PARC LOC, NOTES MAJ déplacés en bas (au-dessus de Déconnexion)',
          'Nouvelle section sidebar-middle pour séparer les sections',
          'Séparateurs visuels entre sections principales et utilitaires',
        ]
      },
      {
        title: '📅 Planning Location - Vue semaine',
        items: [
          'Nouveau bouton "📋 Semaine" pour affichage 14 jours (7j avant/après)',
          'Sensibilité drag adaptée pour navigation précise en mode semaine',
          'Ordre des boutons : Semaine → Mois → Année',
        ]
      },
      {
        title: '🐛 Correctifs',
        items: [
          'Fix couleur verte pour les réservations (conflit avec classe .future)',
          'Fix filtre "Locations en cours" qui affichait toute la base de données',
          'Ajout du cas "location-list" dans EquipmentListView',
          'Fix flèche sous-menus (positionnement bas centré)',
        ]
      },
    ]
  },
  {
    version: '0.8.1',
    date: '2025-10-02',
    title: '🛠️ Gestion avancée du parc et édition des fiches',
    sections: [
      {
        title: '➕ Ajout de nouveau matériel',
        items: [
          'Nouveau bouton "AJOUTER" dans l\'onglet PARC LOC',
          'Formulaire complet pour créer une nouvelle fiche équipement',
          'Champs : Désignation, CMU, Modèle, Marque, Longueur, N° Série, Prix HT/J, État, VGP, Certificat',
          'Ajout automatique avec statut "Sur Parc"',
        ]
      },
      {
        title: '📝 Édition des informations techniques',
        items: [
          'Bouton d\'édition (📜) dans les fiches PARC LOC',
          'Modal d\'édition des informations techniques',
          'Modification de Modèle, Marque, Longueur, N° Série, Prix HT/J, État',
          'Sauvegarde instantanée avec rechargement automatique',
        ]
      },
      {
        title: '🎨 Refonte interface PARC LOC',
        items: [
          'Nouvelle disposition : filtres (50%) + boutons gestion (50%)',
          'Cadres noir/rouge avec liserés rouges cohérents',
          'Boutons centrés : IMPORTER CSV, RÉINITIALISER, AJOUTER',
          'Déplacement des boutons hors de la sidebar',
        ]
      },
      {
        title: '💰 Calcul automatique du CA',
        items: [
          'Calcul des jours ouvrés (hors weekends et jours fériés français)',
          'Badge "Location Longue Durée" pour locations ≥21 jours avec remise 20%',
          'Affichage CA dans historique : "25j × 150€/j - 20% (LD) = 3000€ HT"',
          'Colonnes CA en base : duree_jours_ouvres, prix_ht_jour, remise_ld, ca_total_ht',
        ]
      },
      {
        title: '🔧 Section Gestion Maintenance',
        items: [
          'Panneau maintenance uniquement dans onglet Maintenance',
          'Affichage du motif de maintenance en rouge/noir',
          'Design cohérent avec liserés rouges animés',
          'Masquage automatique dans les autres onglets',
        ]
      },
      {
        title: '📊 Historique enrichi',
        items: [
          'Boutons repositionnés sous la section VGP',
          'Historique Locations (bleu) et Maintenance (rouge)',
          'Affichage détaillé du CA calculé dans l\'historique',
          'Design rouge/noir pour les tableaux d\'historique',
        ]
      },
      {
        title: '🎯 Sections optimisées',
        items: [
          'Section Location affichée uniquement pour En Réservation et En Location',
          'Section VGP réduite (50% largeur) et passage en 1 colonne',
          'Suppression du champ "Dernier VGP" (redondant avec bannière)',
          'Section Location & Maintenance masquée dans Sur Parc',
        ]
      },
    ]
  },
  {
    version: '0.8.0',
    date: '2025-10-02',
    title: '🚀 Système complet de gestion des retours et historiques',
    sections: [
      {
        title: '✅ Gestion des retours de location',
        items: [
          'Nouveau bouton "Effectuer le retour" sur les équipements en location',
          'Modal de retour avec date et note de retour',
          'Passage automatique en statut "En Maintenance" avec motif pré-rempli',
          'Archivage automatique dans l\'historique des locations',
        ]
      },
      {
        title: '📜 Historique complet des équipements',
        items: [
          'Bouton "Historique Locations" dans chaque fiche équipement',
          'Bouton "Historique Maintenance" dans chaque fiche équipement',
          'Visualisation complète de la vie du matériel',
          'Tables détaillées avec dates, clients, notes de retour',
        ]
      },
      {
        title: '🗄️ Architecture base de données optimisée',
        items: [
          'Nouvelle table maintenance_history pour tracer toutes les interventions',
          'Amélioration de location_history avec notes de retour',
          'Index optimisés pour requêtes rapides',
          'Préparation pour analytics et tableaux de bord futurs',
        ]
      },
      {
        title: '🎨 Interface améliorée',
        items: [
          'Affichage des notes de retour dans les fiches En Maintenance',
          'Navigation simplifiée : clic sur onglet ferme automatiquement les fiches',
          'Bouton "Démarrer Location" pour passer de Réservation → Location',
          'Masquage intelligent du bouton "Créer Réservation" selon le statut',
        ]
      },
      {
        title: '🔧 Backend robuste',
        items: [
          'Route POST /api/equipment/:id/return avec transactions sécurisées',
          'Routes GET pour historiques locations et maintenance',
          'Gestion CORS améliorée (ajout méthode PATCH)',
          'Archivage automatique avec rollback en cas d\'erreur',
        ]
      },
      {
        title: '🎯 Workflow complet',
        items: [
          'Sur Parc → Réservation → Location → Retour → Maintenance → Sur Parc',
          'Traçabilité complète de chaque cycle de vie',
          'Base solide pour futures analytics (taux utilisation, revenus, coûts)',
        ]
      }
    ]
  },
  {
    version: '0.7.2',
    date: '2025-10-01',
    title: 'Optimisation responsive mobile et logo MAGI resserré',
    sections: [
      {
        title: '🎨 Logo amélioré',
        items: [
          'Lettres MAGI beaucoup plus rapprochées (letter-spacing: -2px)',
          'Structure logo-container avec span séparés pour MAGI et Loc',
          'Maintien du dégradé rouge et animations',
        ]
      },
      {
        title: '📱 Responsive mobile (<768px)',
        items: [
          'Sidebar passe en position relative sur mobile',
          'Tableaux avec scroll horizontal fluide',
          'Cards dashboard empilées en colonne unique',
          'Inputs tactiles 44px minimum (standard iOS/Android)',
          'Modals adaptées à 95% largeur écran',
          'Grilles détails en colonne unique',
          'Filtres et actions empilés verticalement',
          'Logo réduit sur mobile (32px/16px)',
        ]
      },
      {
        title: '🖥️ Tablettes (<1024px)',
        items: [
          'Sidebar réduite à 200px',
          'Padding et espacements optimisés',
        ]
      },
      {
        title: '✨ Interface simplifiée',
        items: [
          'Navigation directe sans menu hamburger',
          'Sidebar visible mais adaptée sur mobile',
          'Expérience fluide sur tous les appareils',
        ]
      }
    ]
  },
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
