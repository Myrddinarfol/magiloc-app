// Système de gestion des notes de mise à jour
// Pour ajouter une nouvelle version, ajoutez un objet au début du tableau

export const CURRENT_VERSION = '0.9.8.5';

export const releaseNotes = [
  {
    version: '0.9.8.5',
    date: '2025-10-22',
    title: '⚡ UX Moderne - Améliorations Expérience Utilisateur',
    sections: [
      {
        title: '🔄 Synchronisation des Données en Temps Réel',
        items: [
          'Équipement rafraîchi automatiquement après annulation de réservation',
          'Données mises à jour après démarrage de location',
          'État synchronisé après retour de matériel',
          'Interface reflète instantanément les changements d\'état',
        ]
      },
      {
        title: '📋 Validation Intelligente des Formulaires',
        items: [
          'Validation des plages de dates dans tous les modals',
          '"Fin théorique" doit être après "Début location"',
          'Date de retour ne peut pas être avant le début de location',
          'Date de démarrage validée par rapport à la réservation',
          'Messages d\'erreur clairs et localisés en français',
        ]
      },
      {
        title: '💾 Préservation de l\'État des Formulaires',
        items: [
          'Les formulaires conservent leurs données lors de fermeture/réouverture',
          'ReservationModal : Persistance automatique des 7 champs',
          'EditLocationModal : État préservé pendant l\'édition',
          'Données nettoyées après soumission réussie',
          'Les utilisateurs ne perdent plus leur travail accidentellement',
        ]
      },
      {
        title: '✅ Confirmations pour Actions Destructrices',
        items: [
          'CancelReservationModal : Design rouge avec confirmation visuelle',
          'ReturnModal : Validation avant effectuer le retour',
          'StartLocationModal : Vérification des dates avant démarrage',
          'Remplacement des alert() par showToast() pour meilleure UX',
          'Messages cohérents et professionnels via système de notifications',
        ]
      },
      {
        title: '🧹 Nettoyage de la Codebase',
        items: [
          'Consolidation du ReturnModal : une seule implémentation',
          'Suppression de 250+ lignes de code dupliqué',
          'Cohérence entre EquipmentListView et EquipmentDetailView',
          'Source unique de vérité pour chaque composant modal',
          'Meilleure maintenabilité et testabilité',
        ]
      },
      {
        title: '🎯 Contexte Global (UIContext)',
        items: [
          'Ajout reservationFormData pour persistance',
          'Ajout editTechInfoFormData pour édition',
          'Ajout addEquipmentFormData (préparé pour futures améliorations)',
          'Gestion cohérente de l\'état global des formulaires',
        ]
      },
      {
        title: '📊 Modales Améliorées',
        items: [
          'CreateReservationModal : Validation dates + persistance',
          'EditLocationModal : Persistance + validation',
          'ReturnModal : Validation dates + confirmations + showToast',
          'StartLocationModal : Validation dates + meilleure feedback',
          'CancelReservationModal : Confirmations visuelles existantes',
        ]
      },
      {
        title: '✨ Améliorations UX Globales',
        items: [
          'Patterns modernes des applications web d\'entreprise',
          'Feedback utilisateur instantané et clair',
          'Prévention des erreurs côté client',
          'Formulaires respectant les bonnes pratiques React',
          'Experience fluide et prévisible',
        ]
      },
      {
        title: '🔧 Architecture & Bonnes Pratiques',
        items: [
          'Utilisation des Hooks React (useEffect, useState)',
          'Context API pour state management global',
          'Separation of concerns avec composants modulaires',
          'Validation avant transmission au backend',
          'Gestion d\'erreurs robuste avec try/catch',
        ]
      },
      {
        title: '📂 Fichiers Modifiés',
        items: [
          'Modifié : UIContext.js (ajout form data persistence)',
          'Modifié : CreateReservationModal.js (validation + persistance)',
          'Modifié : EditLocationModal.js (persistance + validation)',
          'Modifié : ReturnModal.js (validation + showToast)',
          'Modifié : StartLocationModal.js (validation + showToast)',
          'Modifié : EquipmentDetailView.js (consolidation ReturnModal)',
          'Modifié : App.js (refresh equipment data après opérations)',
        ]
      },
      {
        title: '✅ Tests & Vérifications',
        items: [
          'Build npm run build compile sans erreurs',
          'Tous les modals fonctionnent avec persistance',
          'Validations bloquent les soumissions invalides',
          'Confirmations visibles avant actions destructrices',
          'Données restent synchronisées après opérations',
        ]
      }
    ]
  },
  {
    version: '0.9.8.4',
    date: '2025-10-20',
    title: '📊 Système de Location Longue Durée - Sélection Manuelle',
    sections: [
      {
        title: '🎯 Location Longue Durée Flexible - Manuel vs Automatique',
        items: [
          'Remplacement du système automatique (21+ jours ouvrés) par sélection manuelle',
          'Nouvelle checkbox "📊 Location Longue Durée (-20% remise)" dans modals',
          'Souplesse commerciale : adaptation aux situations non-standard',
          'Permet des remises dégressives en fonction de la stratégie client',
        ]
      },
      {
        title: '✅ Modals de Réservation Améliorés',
        items: [
          'ReservationModal.js : Checkbox longue durée à la création',
          'CreateReservationModal.js : Checkbox longue durée (création depuis PARC LOC)',
          'EditLocationModal.js : Possibilité d\'éditer le statut longue durée',
          'Interface consistante : même checkbox UI dans tous les modals',
          'Validation et sauvegarde du champ estLongDuree',
        ]
      },
      {
        title: '🎨 Affichage Détail Équipement Amélioré',
        items: [
          'Nouvelle section : "Longue Durée: ✅ Oui (-20%)" ou "❌ Non"',
          'Styling conditionnel : vert (#10b981) si longue durée, gris (#9ca3af) sinon',
          'Affichage tarif appliqué : "[prix réduit]€/j au lieu de [prix original]€/j"',
          'Section tarifaire avec arrière-plan vert clair et border',
          'Suppression du calcul automatique des jours ouvrés pour détermination',
        ]
      },
      {
        title: '🔄 Flux Utilisateur Complet',
        items: [
          'Création : Checkbox → Sauvegarde estLongDuree en base',
          'Affichage : Vue détail montre le statut et tarif appliqué',
          'Édition : Modification possible du statut via EditLocationModal',
          'Persistance : Valeur stockée et restituée correctement',
        ]
      },
      {
        title: '💾 Base de Données',
        items: [
          'Nouveau champ estLongDuree (boolean/integer) sur table equipments',
          'Support valeurs boolean (true/false) et integer (1/0)',
          'Compatibilité : Equipment detail gère les deux formats',
          'Validation : Conversion automatique estLongDuree === true || estLongDuree === 1',
        ]
      },
      {
        title: '🔧 Architecture Technique',
        items: [
          'equipmentService.update() : Passe estLongDuree sans modification',
          'React Hooks : Form state avec estLongDuree: false par défaut',
          'EquipmentDetailView : Calcul isLongDuration avec coalescing sécurisé',
          'Pas de breaking changes : compatible avec anciennes données',
        ]
      },
      {
        title: '✨ Améliorations UX',
        items: [
          'Checkbox avec emoji 📊 et label explicite "(-20% remise)"',
          'Indication claire du bénéfice financier',
          'Style cohérent : flex layout, cursor pointer, 18px checkbox',
          'Intégration naturelle dans les formulaires de réservation',
        ]
      },
      {
        title: '📂 Fichiers Modifiés/Créés',
        items: [
          'Modifié : ReservationModal.js (+checkbox, +form state)',
          'Modifié : CreateReservationModal.js (+checkbox, +form state)',
          'Modifié : EditLocationModal.js (+checkbox, +form init, +submit)',
          'Modifié : EquipmentDetailView.js (affichage longue durée + tarif)',
          'Inchangé : equipmentService.js (déjà générique)',
        ]
      },
      {
        title: '✅ Tests & Vérifications',
        items: [
          'Build : npm run build compile sans erreurs',
          'Reservation : Checkbox fonctionnel, valeur sauvegardée',
          'Detail view : Affichage correct du statut et tarif',
          'Edit modal : Modification du statut longue durée persistée',
          'Compatibilité : Anciennes données sans estLongDuree restent OK',
        ]
      }
    ]
  },
  {
    version: '0.9.8.3',
    date: '2025-10-18',
    title: '✨ Gestion Clients Améliorée + Fix CSS Specificity Boutons',
    sections: [
      {
        title: '👥 Nouveau Onglet CLIENT - Gestion Complète',
        items: [
          'Nouvel onglet CLIENT dans le menu GESTION PARC (👥)',
          'Gestion complète des clients : Création, Modification, Suppression',
          'Formulaire riche avec champs : Nom (*requis), Email, Téléphone, Adresse, Contacts, Notes',
          'Support multi-contacts avec affichage en badges (un contact par ligne)',
          'Barre de recherche en temps réel (filtrage nom, email, téléphone, contact)',
          'Bouton import automatique depuis réservations/locations en cours',
          'Toast notifications pour toutes les actions',
        ]
      },
      {
        title: '🎨 Interface Clients - Layout 3 Colonnes Optimisé',
        items: [
          'Design complet : Infos | Notes | Actions',
          'Section infos : nom + email + téléphone + adresse + contacts (badges)',
          'Section notes : panneau central affichant les notes détaillées',
          'Section actions : 3 boutons (historique 📋, modifier ✏️, supprimer ✕)',
          'Ligne client élégante : fond dégradé, border rouge, hover animation',
          'Responsive : 3 colonnes desktop → 1 colonne mobile',
        ]
      },
      {
        title: '🗑️ Modal Suppression Client Stylisée',
        items: [
          'Modal confirmation réutilisable : DeleteClientModal',
          'Design identique à DeleteConfirmModal de PARC LOC',
          'Icône poubelle 🗑️ animée (bounce 2s)',
          'Titre rouge "⚠️ SUPPRESSION DÉFINITIVE"',
          'Nom client affiché en jaune/ambre (#fbbf24)',
          'Message alerte : "Cette action est irréversible !"',
          'Boutons Annuler (gris) et Supprimer (rouge) avec hover effects',
        ]
      },
      {
        title: '👤 Historique Locations par Client',
        items: [
          'Nouveau bouton 📋 "Historique" dans chaque client',
          'Modal affichant toutes les locations/réservations associées',
          'Design moderne : header rouge dégradé, backdrop blur 8px',
          'Animations : fadeIn overlay + slideUp modal',
          'Table avec colonnes : Client, Dates, Durée, CA HT, Notes',
          'Intégration complète avec historyService',
        ]
      },
      {
        title: '🔧 Fix Critique - CSS Specificity Boutons Actions',
        items: [
          'Cause : Sélecteur parent .client-actions-panel avait plus haute spécificité',
          'Symptôme : Couleurs des boutons ne s\'appliquaient pas (restaient bleues)',
          'Solution : Augmentation spécificité des sélecteurs de couleur',
          'Résultat :',
          '  • ✏️ Modifier → Amber/Jaune gradient (#fbbf24)',
          '  • ✕ Supprimer → Rouge gradient (#dc2626)',
          '  • 📋 Historique → Bleu gradient (#60a5fa)',
          'Build successfully compiled - CSS changes now effective',
        ]
      },
      {
        title: '📂 Fichiers Créés/Modifiés',
        items: [
          'Créés : ClientManagementPage.js (430 lignes)',
          'Créés : ClientManagementPage.css (510 lignes)',
          'Créés : DeleteClientModal.js (195 lignes, composant modal)',
          'Créés : ClientLocationHistoryModal.js (intégration historique)',
          'Modifiés : Sidebar.js (ajout menu CLIENT)',
          'Modifiés : App.js (routes + context integration)',
          'Modifiés : useClient.js hook (CRUD clients)',
        ]
      },
      {
        title: '✨ UX Améliorations',
        items: [
          'Validation : nom client requis avec message spécifique',
          'Affichage : listes vides avec message informatif',
          'Feedback : toasts de succès/erreur après chaque action',
          'Performance : recherche en temps réel optimisée',
          'Import : détection automatique clients uniques de réservations/locations',
          'Responsive : design 3 colonnes adapté à tous les écrans',
        ]
      },
      {
        title: '✅ Tests de Vérification',
        items: [
          'Création client : validation + sauvegarde ✓',
          'Modification client : champs éditables + mise à jour ✓',
          'Suppression client : modal confirmation + historique protégé ✓',
          'Recherche : filtrage temps réel multi-champs ✓',
          'Import : détection et ajout clients uniques ✓',
          'Couleurs boutons : toutes les couleurs affichées correctement ✓',
          'Responsive : layout adapté mobile/tablet/desktop ✓',
        ]
      }
    ]
  },
  {
    version: '0.9.8',
    date: '2025-10-17',
    title: '🔧 Gestion Maintenance + Historiques Modernes + UI Améliorée',
    sections: [
      {
        title: '🐛 Fix Critique - Validation Maintenance',
        items: [
          'Fix bug : Le matériel restait en statut "En Maintenance" après validation',
          'Cause : Le frontend ne mettait pas à jour le contexte React après validation backend',
          'Solution : Normalisation de l\'équipement + mise à jour contexte + cache',
          'Maintenant : Le matériel passe correctement en "Sur Parc" et disparaît de l\'onglet maintenance',
        ]
      },
      {
        title: '📚 Historiques Intégrés dans Fiches Maintenance',
        items: [
          'Nouvelle section "Historiques" dans le panneau gauche de gestion maintenance',
          '2 boutons : 📜 Locations et 🔧 Maintenance',
          'Affichage modal complet de tous les historiques associés',
          'Design cohérent avec les fiches matériels (thème noir/rouge)',
          'Accès direct depuis page de maintenance (avant validation)',
        ]
      },
      {
        title: '✨ Modals Historiques Redesignées',
        items: [
          'Refonte complète des modals Location & Maintenance History',
          'Thème moderne : Noir/Gris/Rouge avec gradients élégants',
          'Animations fluides : fadeIn overlay + slideUp modal + hover effects',
          'Header rouge dégradé avec icône, titre et compteur de lignes',
          'Overlay avec blur backdrop (8px) pour effet professionnel',
          'Table avec colonnes bien dimensionnées et espacement optimal',
        ]
      },
      {
        title: '📊 Table Historique Locations Améliorée',
        items: [
          'Colonnes optimisées : Client (badge rouge), Dates (début/retour), Durée, CA HT, Offre, Notes',
          'Client affiché en badge rouge gradient avec ombres',
          'Dates avec labels et valeurs pour meilleure lisibilité',
          'Durée en badge gris/rouge arrondi',
          'CA HT avec montant en vert + détail du calcul en italique',
          'Notes de retour en texte italique rouge avec border gauche',
          'Lignes avec hover effect qui les highlight légèrement',
        ]
      },
      {
        title: '🔧 Table Historique Maintenance Améliorée',
        items: [
          'Colonnes optimisées : Période (entrée/sortie), Motif, Durée, Travaux, Notes',
          'Période affichée avec labels pour clarté (Entrée/Sortie)',
          'Motif en badge rouge transparent avec border gauche',
          'Durée en badge compact',
          'Travaux avec parsing JSON (extraction notes_maintenance ou pieces_utilisees)',
          'Truncate et ellipsis avec tooltip au survol sur textes longs',
          'Notes retour en rose/rouge italic avec border distinctive',
        ]
      },
      {
        title: '🎨 Boutons Historiques - Design Sobre & Moderne',
        items: [
          'Nouveau design frosted glass (backdrop-filter: blur(4px))',
          'Couleurs neutres : gris-blanc clair au lieu du rouge agressif',
          'Fond translucide : rgba(255, 255, 255, 0.06)',
          'Border blanc subtil : rgba(255, 255, 255, 0.15)',
          'Texte gris clair : #d0d0d0',
          'Hover : fond s\'éclaircit + border blanc + texte devient blanc',
          'Effect shadow doux et inset au hover pour profondeur',
          'Animations smooth avec cubic-bezier parfait',
        ]
      },
      {
        title: '✨ CSS Dédié - HistoryModals.css',
        items: [
          'Nouveau fichier CSS pour isolation des styles : HistoryModals.css',
          '700+ lignes de CSS professionnel et moderne',
          'Thème sombre complet avec variables cohérentes',
          'Animations complètes : fadeInOverlay, slideUpModal, hover effects',
          'Responsive design : desktop, tablette, mobile',
          'Scrollbar customisée en rouge (8px large, arrondie)',
          'Custom scrolling momentum iOS (-webkit-overflow-scrolling)',
        ]
      },
      {
        title: '🔧 Gestion Normalization Équipement',
        items: [
          'Nouvelle fonction normalizeEquipment() dans MaintenanceDetailPage.js',
          'Convertit équipement du format DB (snake_case) au frontend (camelCase)',
          'Formate toutes les dates en français (DD/MM/YYYY)',
          'Essentiellement pour combatibilité backend → frontend',
          'Évite les erreurs de mapping après validation maintenance',
        ]
      },
      {
        title: '📂 Fichiers Modifiés/Créés',
        items: [
          'Créé : HistoryModals.css (700+ lignes, design moderne)',
          'Modifié : MaintenanceDetailPage.js (+50 lignes imports + handlers)',
          'Modifié : LocationHistoryModal.js (refonte complète, nouveau structure)',
          'Modifié : MaintenanceHistoryModal.js (refonte complète, formatTravaux)',
          'Modifié : MaintenanceDetailPage.css (amélioration boutons historiques)',
          'Total : +850 insertions pour un design pro et maintainable',
        ]
      },
      {
        title: '🎯 Architecture Améliorée',
        items: [
          'Contexte équipement : mise à jour directe avec normalizeEquipment()',
          'Cache local : synchronisé après validation maintenance',
          'Historiques : chargement lazy via historyService (optimisation)',
          'Modals : complètement découplés dans HistoryModals.css (isolation)',
          'Type-safe : propriétés cohérentes frontend ↔ backend',
        ]
      },
      {
        title: '✅ Tests de Vérification',
        items: [
          'Validation maintenance : le matériel passe en "Sur Parc" ✓',
          'Contexte : l\'équipement disparaît de l\'onglet maintenance ✓',
          'Historiques : boutons chargent les modals correctement ✓',
          'Modals : design moderne et animations fluides ✓',
          'Responsive : fonctionne sur desktop, tablette, mobile ✓',
          'Performance : pas de lag lors du chargement des historiques ✓',
        ]
      }
    ]
  },
  {
    version: '0.9.7',
    date: '2025-10-13',
    title: '✨ Modals Stylés Actions Réservation/Location + Correctifs Navigation',
    sections: [
      {
        title: '🆕 Onglet CLIENT - Gestion complète',
        items: [
          'Nouvel onglet CLIENT dans le menu GESTION PARC (👥)',
          'Gestion complète des clients : Création, Modification, Suppression',
          'Formulaire avec champs : Nom (*requis), Email, Téléphone, Adresse, Contact Principal, Notes',
          'Validation des champs avec messages d\'erreur clairs',
          'Table affichant tous les clients avec actions d\'édition/suppression',
          'Toast notifications pour les actions réussies/échouées',
        ]
      },
      {
        title: '🔩 Onglet PIECES DETACHEES - Gestion complète',
        items: [
          'Nouvel onglet PIECES_DETACHEES dans le menu MAINTENANCE (🔩)',
          'Gestion complète des pièces détachées : Création, Modification, Suppression',
          'Lien automatique avec les équipements du parc',
          'Table avec colonnes : Référence, Désignation, Équipement, Coût Unitaire, Quantité, Fournisseur',
          'Calcul automatique du coût total des pièces filtrées',
          'Filtrage dynamique par équipement avec compteur',
          'Affichage équipement enrichi : Désignation (CMU), Marque, Modèle en multi-lignes',
        ]
      },
      {
        title: '🔍 Interface Avancée de Sélection d\'Équipement',
        items: [
          'Modal agrandi de 600px → 900px pour meilleure interface',
          'Section de recherche par caractéristique avec 4 menus déroulants :',
          '  • Désignation (liste de toutes les désignations uniques)',
          '  • CMU (liste de tous les CMU uniques)',
          '  • Marque (liste de toutes les marques uniques)',
          '  • Modèle (liste de tous les modèles uniques)',
          'Filtrage en cascade : quand tu sélectionnes une Désignation, le menu CMU affiche UNIQUEMENT les CMU pour cette désignation, etc.',
          'Zéro option invalide ou incompatible',
          'Liste des équipements correspondants avec affichage : Désignation (CMU) + Marque Modèle • Série',
          'Sélection par clic sur un équipement (mise en surbrillance bleue)',
          'Section de confirmation en vert ✅ affichant tous les détails complets',
        ]
      },
      {
        title: '✨ Fonctionnalités du Filtrage en Cascade',
        items: [
          'Filtrage dynamique et intelligent en temps réel',
          'Sélectionne "Palan Manuel" → CMU propose uniquement les CMU disponibles pour Palan Manuel',
          'Sélectionne CMU "500kg" → Marque propose uniquement les marques Palan 500kg',
          'Sélectionne Marque "ACME" → Modèle propose uniquement les modèles ACME pour cette combo',
          'Sélectionne Modèle → Liste finale affiche équipements correspondants',
          'Impossible de créer une combinaison inexistante',
          'Meilleure UX et zéro confusion avec les anciennes méthodes',
        ]
      },
      {
        title: '📋 Composant ClientAutocomplete',
        items: [
          'Autocomplete intelligent pour sélection clients dans modal réservation',
          'Filtrage en temps réel lors de la saisie du nom',
          'Navigation au clavier : Flèches ↑↓, Enter pour sélectionner, Escape pour fermer',
          'Affichage email et téléphone dans les suggestions',
          'Fermeture automatique au clic externe',
          'Design harmonisé avec le reste de l\'interface (bordure jaune/ambre)',
        ]
      },
      {
        title: '🎨 Design & Styling',
        items: [
          'Sélects de filtrage avec fond foncé rgba(31, 41, 55, 0.8) et texte blanc',
          'Options avec background #1f2937 et texte blanc (lisibilité 100%)',
          'Bordures bleues (#64c8ff) pour section filtres',
          'Section résultats scrollable (max 250px)',
          'Équipements avec hover effect et classe "selected" en bleu',
          'Grille 2x2 pour les 4 critères de filtrage',
          'Icônes cohérentes : 🔍 pour filtres, ✅ pour confirmation',
          'Tables avec hauteur ligne 70px minimum pour texte multi-ligne',
          'Affichage équipement en 2 lignes : Désignation + Brand/Model',
        ]
      },
      {
        title: '🔧 Architecture Technique',
        items: [
          'ClientContext + ClientProvider pour gestion d\'état globale des clients',
          'SparePartsContext + SparePartsProvider pour gestion d\'état des pièces',
          'Hooks personnalisés : useClient() et useSpareParts()',
          'Pages : ClientManagementPage.js et SparePartsManagementPage.js',
          'Composant réutilisable : ClientAutocomplete.js',
          'Backend : 15+ routes API pour CRUD clients et pièces détachées',
          'Migration SQL : 3 tables (clients, spare_parts, spare_parts_usage)',
        ]
      },
      {
        title: '🐛 Correctifs & Validations',
        items: [
          'Validation formulaire client : nom requis avec message spécifique',
          'Validation formulaire pièce détachée : référence requise, désignation requise, quantité ≥ 1',
          'Affichage message "Aucune pièce enregistrée" quand liste vide',
          'Rechargement automatique de la liste après création/modification',
          'Réinitialisation des filtres lors fermeture du modal',
          'Gestion erreurs API avec affichage de messages clairs',
        ]
      },
      {
        title: '📂 Fichiers Modifiés/Créés',
        items: [
          'Créés : ClientManagementPage.js, SparePartsManagementPage.js',
          'Créés : ClientContext.js, SparePartsContext.js',
          'Créés : useClient.js, useSpareParts.js hooks',
          'Créés : ClientAutocomplete.js (composant réutilisable)',
          'Créés : CSS files pour pages et composants',
          'Modifiés : App.js (ajout providers et routes)',
          'Modifiés : Sidebar.js (ajout CLIENT et PIECES_DETACHEES)',
          'Modifiés : CreateReservationModal.js (intégration ClientAutocomplete)',
          'Backend : +200 lignes (routes API + migration DB)',
        ]
      }
    ]
  },
  {
    version: '0.9.7',
    date: '2025-10-13',
    title: '✨ Modals Stylés Actions Réservation/Location + Correctifs Navigation',
    sections: [
      {
        title: '🎨 Nouveaux modals avec design unifié',
        items: [
          'CancelReservationModal : Annulation réservation (thème rouge avec icône ⚠️)',
          'CreateReservationModal : Création réservation 5 champs (thème jaune/ambre)',
          'StartLocationModal : Démarrage location avec date (thème vert)',
          'ReturnModal : Retour location avec date + notes (thème bleu)',
          'Design cohérent : overlay backdrop blur, animations fadeIn/slideUp/bounce',
          'Bordures colorées selon action, gradients élégants',
        ]
      },
      {
        title: '📋 Modal Création Réservation',
        items: [
          'Formulaire complet : CLIENT (*requis), DEBUT LOCATION, FIN THEORIQUE',
          'Champs supplémentaires : N° OFFRE, NOTES de location',
          'Validation client-side avec alertes si champs requis manquants',
          'Passe automatiquement le statut en "En Réservation"',
          'Intégré dans tableaux SUR PARC ET fiches détail PARC LOC',
        ]
      },
      {
        title: '🚀 Modal Démarrage Location',
        items: [
          'Sélection date de début de location',
          'Date pré-remplie avec aujourd\'hui',
          'Message clair : "Le matériel passera en statut EN LOCATION"',
          'Carte info équipement avec désignation et n° série',
          'Bouton avec gradient vert + effet hover',
        ]
      },
      {
        title: '↩️ Modal Retour Location',
        items: [
          'Sélection date de retour',
          'Textarea pour notes de retour (sauvegardées dans historique)',
          'Affichage date de départ de la location',
          'Message : "Le matériel passera en statut EN MAINTENANCE"',
          'Notes enregistrées automatiquement dans location_history',
        ]
      },
      {
        title: '❌ Modal Annulation Réservation',
        items: [
          'Confirmation stylée avec icône ⚠️ animée',
          'Message clair : "Le matériel sera remis SUR PARC"',
          'Boutons Annuler (gris) et Confirmer (rouge) avec hover',
          'Réinitialisation complète des données de réservation',
        ]
      },
      {
        title: '🎯 Boutons d\'action dans tableaux',
        items: [
          'SUR PARC : 📋 Créer réservation (bouton jaune)',
          'EN RÉSERVATION : 🚀 Démarrer location + ❌ Annuler',
          'EN LOCATION : ↩️ Effectuer retour',
          'Tous avec tooltips informatifs',
          'e.stopPropagation() pour éviter conflits avec row onClick',
        ]
      },
      {
        title: '🐛 Correctifs bugs navigation',
        items: [
          'Fix handleOpenEquipmentDetail ne change plus currentPage',
          'Fix handleGoBack retourne correctement à la page précédente',
          'Fix handleCancelReservation accepte maintenant paramètre equipment',
          'Fix bouton retour manquant dans LocationListPage',
          'Fix condition affichage bouton "Créer Réservation" dans détail',
        ]
      },
      {
        title: '🔧 Handlers et intégrations',
        items: [
          'handleCancelReservation : remet Sur Parc, réinitialise données',
          'handleStartLocation : passe En Location avec date début',
          'handleReturnLocation : archive + passe En Maintenance + notes',
          'handleCreateReservation : crée réservation avec 5 champs',
          'Props passées à EquipmentListView, LocationListPage, EquipmentDetailView',
        ]
      },
      {
        title: '✨ Validation et UX',
        items: [
          'Validation côté client pour champs requis',
          'Alertes claires si données manquantes',
          'Toast notifications de succès après chaque action',
          'Rechargement automatique des données après validation',
          'Formulaires réinitialisés après chaque soumission',
        ]
      },
      {
        title: '📂 Fichiers modifiés/créés',
        items: [
          'Nouveaux : CancelReservationModal.js, CreateReservationModal.js',
          'Modifiés : App.js (+4 handlers), EquipmentListView.js (+157 lignes)',
          'Modifiés : EquipmentDetailView.js, UIContext.js, LocationListPage.js',
          'Refactoring : StartLocationModal.js, ReturnModal.js (design unifié)',
          'Total : +1326 insertions, -193 suppressions',
        ]
      }
    ]
  },
  {
    version: '0.9.4',
    date: '2025-10-10',
    title: '📱 Optimisation Mobile & Tablette - Responsive Design',
    sections: [
      {
        title: '📱 Interface Mobile Complète',
        items: [
          'Hamburger menu animé (☰ → ✕) en haut à gauche sur mobile',
          'Sidebar slide-in depuis la gauche avec overlay sombre',
          'Fermeture automatique de la sidebar après navigation',
          'Support tactile complet avec zones de 44px minimum',
          'Meta tags optimisés pour iOS et Android',
        ]
      },
      {
        title: '🔒 Protection Anti-Débordement',
        items: [
          'Overflow-x: hidden global sur html, body, #root, .app',
          'Aucun fond blanc ne doit apparaître lors du scroll',
          'Main content adapté : max-width 100vw sur mobile',
          'Toutes les pages protégées contre le débordement horizontal',
        ]
      },
      {
        title: '📊 Dashboard Mobile Optimisé',
        items: [
          'Stats compactes affichées en haut (pleine largeur)',
          'Matériels Phares EN DESSOUS des stats (plus coupés)',
          'Tout en 1 colonne : stats → featured → alertes → ruptures',
          'Alertes grid en 1 colonne (4 capsules empilées)',
          'Police et padding réduits pour meilleure lisibilité',
        ]
      },
      {
        title: '📅 Planning Location Mobile',
        items: [
          'Timeline scrollable horizontalement (500px min)',
          'Labels compacts : 120px de large, 11px de police',
          'Barres de location : 32px de hauteur, 9px de police',
          'Dates sticky en haut avec font 9px',
          'Message d\'aide : "👈 Glissez pour naviguer 👉"',
          'Label AUJOURD\'HUI caché sur mobile (gain de place)',
          'Grid adapté : 120px (label) + 1fr (timeline)',
        ]
      },
      {
        title: '🎨 Responsive Breakpoints',
        items: [
          'Desktop > 1024px : comportement normal',
          'Tablet 768-1024px : 2 colonnes pour stats',
          'Mobile < 768px : 1 colonne + hamburger menu',
          'Small Mobile < 480px : ultra compact',
          'Landscape mode : hauteur adaptée pour téléphones',
        ]
      },
      {
        title: '📝 Formulaires & Modals Tactiles',
        items: [
          'Inputs 16px (évite zoom auto iOS)',
          'Hauteur minimum 44px pour tous les boutons',
          'Modals plein écran sur mobile (animation slide-up)',
          'Form-row en 1 colonne sur mobile',
          'Scroll momentum iOS (-webkit-overflow-scrolling)',
        ]
      },
      {
        title: '📋 Tables & Listes Responsive',
        items: [
          'Scroll horizontal avec momentum iOS',
          'Indicateur "← Faites défiler →" sur les tables',
          'Equipment table : min-width 800px pour lisibilité',
          'Police réduite à 14px sur mobile, 12px sur small mobile',
          'Actions buttons espacés : min 44x44px',
        ]
      },
      {
        title: '🎯 Optimisations Tactiles',
        items: [
          'Zones tactiles minimum 44x44px partout',
          'Retrait des effets hover sur devices tactiles',
          'Feedback :active visible (scale 0.95 + opacity)',
          'Pas de transform sur hover en mode tactile',
          'Animations désactivées sur mobile (économie batterie)',
        ]
      },
      {
        title: '🔧 Corrections Backend',
        items: [
          'CORS : ajout de http://localhost:5001 pour dev',
          'DATABASE_URL : migration vers nouvelle base Render',
          'Connection pool optimisé : max 10, min 2, keepAlive',
          'Date conversion : support format français DD/MM/YYYY',
          'Gestion erreurs améliorée avec details et hints',
        ]
      },
      {
        title: '📂 Fichiers Modifiés',
        items: [
          'App.css : +600 lignes de media queries responsive',
          'Sidebar.js : hamburger menu + état mobile',
          'index.html : meta tags mobile optimisés',
          'server.js : CORS + connexion DB corrigée',
          'db.js : connectionString directe + keepAlive',
        ]
      }
    ]
  },
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
