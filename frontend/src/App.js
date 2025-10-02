import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { equipmentData as initialData } from './data/equipments';
import CSVImporter from './components/CSVImporter';
import EquipmentListView from './components/EquipmentListView';
import ReleaseNotesHistory from './components/ReleaseNotesHistory';
import { releaseNotes, CURRENT_VERSION, hasNewVersion } from './data/releaseNotes';
import './App.css';

function App() {
  // Clés pour le stockage local
  const STORAGE_KEY = 'magiloc-equipment-data';
  const AUTH_KEY = 'magiloc-authenticated';
  const VERSION_KEY = 'magiloc-last-seen-version';
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // États pour l'authentification et les notes
  const [showReleaseNotes, setShowReleaseNotes] = useState(() => {
    const lastSeenVersion = localStorage.getItem(VERSION_KEY);
    return hasNewVersion(lastSeenVersion);
  });
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  // États existants
  const [equipmentData, setEquipmentData] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCertificatModal, setShowCertificatModal] = useState(false);
  const [certificatInput, setCertificatInput] = useState('');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    client: '',
    debutLocation: '',
    finLocationTheorique: '',
    numeroOffre: '',
    notesLocation: ''
  });
  const [loadingMessage, setLoadingMessage] = useState('Chargement des données...');
  const [retryCount, setRetryCount] = useState(0);
  const [showStartLocationModal, setShowStartLocationModal] = useState(false);
  const [startLocationDate, setStartLocationDate] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState({
    rentreeLe: '',
    noteRetour: ''
  });
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [showEditTechInfoModal, setShowEditTechInfoModal] = useState(false);
  const [techInfoForm, setTechInfoForm] = useState({
    modele: '',
    marque: '',
    longueur: '',
    numeroSerie: '',
    prixHT: '',
    etat: ''
  });
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [addEquipmentForm, setAddEquipmentForm] = useState({
    designation: '',
    cmu: '',
    modele: '',
    marque: '',
    longueur: '',
    numeroSerie: '',
    prixHT: '',
    etat: '',
    prochainVGP: '',
    certificat: ''
  });

  // Fonction de chargement des équipements (déplacée hors du useEffect pour être réutilisable)
  const loadEquipments = async (attemptNumber = 1) => {
    const MAX_RETRIES = 12;
    const RETRY_DELAY = 5000;

    try {
      console.log(`🔍 Tentative ${attemptNumber}/${MAX_RETRIES} - Chargement depuis:`, `${API_URL}/api/equipment`);

      if (attemptNumber === 1) {
        setLoadingMessage('Chargement des données...');
      } else if (attemptNumber <= 3) {
        setLoadingMessage('⏳ Le serveur démarre... (peut prendre 30 secondes)');
      } else {
        setLoadingMessage(`🔄 Nouvelle tentative ${attemptNumber}/${MAX_RETRIES}...`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/api/equipment`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données reçues:', data.length, 'équipements');
        setEquipmentData(data);
        setRetryCount(0);
        setIsLoading(false);
        return;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Erreur tentative ${attemptNumber}:`, error.message);

      if (attemptNumber < MAX_RETRIES) {
        setRetryCount(attemptNumber);
        setTimeout(() => {
          loadEquipments(attemptNumber + 1);
        }, RETRY_DELAY);
      } else {
        console.error('💥 Échec après', MAX_RETRIES, 'tentatives');
        setLoadingMessage('❌ Impossible de charger les données. Le serveur ne répond pas.');
        setEquipmentData([]);
        setIsLoading(false);
      }
    }
  };

  // Chargement initial au montage
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      loadEquipments();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Gestion des notes de mise à jour
  const handleNotesAccepted = () => {
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    setShowReleaseNotes(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  // Fonction pour gérer la navigation (ferme la fiche détaillée automatiquement)
  const handleNavigate = (page) => {
    setSelectedEquipment(null); // Ferme la fiche si ouverte
    setCurrentPage(page);
  };

  // Fonction pour générer le lien du certificat
  const getCertificatLink = (certificat) => {
    if (!certificat) return null;

    // Si c'est un numéro CML, générer l'URL VTIC
    if (certificat.match(/^CML\d+$/i)) {
      return `https://v-tic.com/prd/${certificat}`;
    }

    // Si c'est déjà une URL, la retourner telle quelle
    if (certificat.startsWith('http://') || certificat.startsWith('https://')) {
      return certificat;
    }

    return null;
  };

  // Fonction pour calculer les jours ouvrés (lundi-vendredi, hors jours fériés français)
  const calculateBusinessDays = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return null;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) return null;

    // Jours fériés français 2025-2026 (à adapter selon les années)
    const holidays = [
      '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09',
      '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
      '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25',
      '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25'
    ];

    let businessDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];

      // Compter seulement si c'est un jour de semaine (1-5) et pas un jour férié
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
        businessDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return businessDays;
  };

  // Fonction pour mettre à jour le certificat
  const handleSaveCertificat = async () => {
    if (!certificatInput.trim()) {
      alert('Veuillez saisir un numéro de certificat ou une URL');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/equipment/${selectedEquipment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificat: certificatInput.trim()
        })
      });

      if (response.ok) {
        // Mettre à jour l'équipement sélectionné
        const updatedEquipment = { ...selectedEquipment, certificat: certificatInput.trim() };
        setSelectedEquipment(updatedEquipment);

        // Mettre à jour la liste des équipements
        setEquipmentData(equipmentData.map(eq =>
          eq.id === selectedEquipment.id ? updatedEquipment : eq
        ));

        setShowCertificatModal(false);
        setCertificatInput('');
        alert('Certificat mis à jour avec succès !');
      } else {
        alert('Erreur lors de la mise à jour du certificat');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du certificat');
    }
  };

  // Fonction pour créer une réservation
  const handleCreateReservation = async () => {
    if (!reservationForm.client.trim()) {
      alert('Veuillez saisir le nom du client');
      return;
    }

    try {
      console.log('🔄 Création de réservation pour:', selectedEquipment?.designation);
      console.log('📦 Données envoyées:', {
        statut: 'En Réservation',
        client: reservationForm.client.trim(),
        debutLocation: reservationForm.debutLocation || null,
        finLocationTheorique: reservationForm.finLocationTheorique || null,
        numeroOffre: reservationForm.numeroOffre.trim() || null,
        notesLocation: reservationForm.notesLocation.trim() || null
      });

      const response = await fetch(`${API_URL}/api/equipment/${selectedEquipment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statut: 'En Réservation',
          client: reservationForm.client.trim(),
          debutLocation: reservationForm.debutLocation || null,
          finLocationTheorique: reservationForm.finLocationTheorique || null,
          numeroOffre: reservationForm.numeroOffre.trim() || null,
          notesLocation: reservationForm.notesLocation.trim() || null
        })
      });

      console.log('📡 Réponse HTTP:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Réservation créée:', result);

        await loadEquipments();
        setShowReservationModal(false);
        setReservationForm({
          client: '',
          debutLocation: '',
          finLocationTheorique: '',
          numeroOffre: '',
          notesLocation: ''
        });
        setSelectedEquipment(null);
        alert('Réservation créée avec succès !');
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', response.status, errorText);
        alert(`Erreur lors de la création de la réservation: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      alert(`Erreur lors de la création de la réservation: ${error.message}`);
    }
  };

  // Fonction pour démarrer une location
  const handleStartLocation = async () => {
    if (!startLocationDate) {
      alert('Veuillez saisir la date de début de location');
      return;
    }

    try {
      console.log('🚀 Démarrage de location pour:', selectedEquipment?.designation);
      console.log('📅 Date de début:', startLocationDate);

      const response = await fetch(`${API_URL}/api/equipment/${selectedEquipment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statut: 'En Location',
          debutLocation: startLocationDate
        })
      });

      console.log('📡 Réponse HTTP:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Location démarrée:', result);

        await loadEquipments();
        setShowStartLocationModal(false);
        setStartLocationDate('');
        setSelectedEquipment(null);
        alert('Location démarrée avec succès !');
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', response.status, errorText);
        alert(`Erreur lors du démarrage de la location: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      alert(`Erreur lors du démarrage de la location: ${error.message}`);
    }
  };

  // Fonction pour effectuer le retour d'un équipement
  const handleReturn = async () => {
    if (!returnForm.rentreeLe) {
      alert('Veuillez saisir la date de retour');
      return;
    }

    try {
      console.log('🔄 Retour pour:', selectedEquipment?.designation);
      console.log('📦 Données:', returnForm);

      const response = await fetch(`${API_URL}/api/equipment/${selectedEquipment.id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnForm)
      });

      console.log('📡 Réponse HTTP:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Retour effectué:', result);

        await loadEquipments();
        setShowReturnModal(false);
        setReturnForm({ rentreeLe: '', noteRetour: '' });
        setSelectedEquipment(null);
        alert('Retour effectué avec succès ! Le matériel est maintenant en maintenance.');
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', response.status, errorText);
        alert(`Erreur lors du retour: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      alert(`Erreur lors du retour: ${error.message}`);
    }
  };

  // Fonctions pour charger les historiques
  const loadLocationHistory = async (equipmentId) => {
    try {
      const response = await fetch(`${API_URL}/api/equipment/${equipmentId}/location-history`);
      if (response.ok) {
        const data = await response.json();
        setLocationHistory(data);
        setShowLocationHistory(true);
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique locations:', error);
      alert('Erreur lors du chargement de l\'historique des locations');
    }
  };

  const loadMaintenanceHistory = async (equipmentId) => {
    try {
      const response = await fetch(`${API_URL}/api/equipment/${equipmentId}/maintenance-history`);
      if (response.ok) {
        const data = await response.json();
        setMaintenanceHistory(data);
        setShowMaintenanceHistory(true);
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique maintenance:', error);
      alert('Erreur lors du chargement de l\'historique de maintenance');
    }
  };

  // Fonction pour ouvrir le modal d'édition des informations techniques
  const handleOpenEditTechInfo = () => {
    setTechInfoForm({
      modele: selectedEquipment.modele || '',
      marque: selectedEquipment.marque || '',
      longueur: selectedEquipment.longueur || '',
      numeroSerie: selectedEquipment.numeroSerie || '',
      prixHT: selectedEquipment.prixHT || '',
      etat: selectedEquipment.etat || ''
    });
    setShowEditTechInfoModal(true);
  };

  // Fonction pour sauvegarder les modifications des informations techniques
  const handleSaveTechInfo = async () => {
    try {
      console.log('💾 Sauvegarde des informations techniques pour:', selectedEquipment?.designation);
      console.log('📝 Nouvelles données:', techInfoForm);

      const response = await fetch(`${API_URL}/api/equipment/${selectedEquipment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modele: techInfoForm.modele,
          marque: techInfoForm.marque,
          longueur: techInfoForm.longueur,
          numeroSerie: techInfoForm.numeroSerie,
          prixHT: techInfoForm.prixHT,
          etat: techInfoForm.etat
        })
      });

      console.log('📡 Réponse HTTP:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Informations techniques mises à jour:', result);

        await loadEquipments();
        setShowEditTechInfoModal(false);
        setTechInfoForm({
          modele: '',
          marque: '',
          longueur: '',
          numeroSerie: '',
          prixHT: '',
          etat: ''
        });
        alert('Informations techniques mises à jour avec succès !');
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', response.status, errorText);
        alert(`Erreur lors de la mise à jour: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      alert(`Erreur lors de la mise à jour: ${error.message}`);
    }
  };

  // Fonction pour ajouter un nouvel équipement
  const handleAddEquipment = async () => {
    // Validation des champs obligatoires
    if (!addEquipmentForm.designation || !addEquipmentForm.numeroSerie) {
      alert('Veuillez renseigner au minimum la Désignation et le N° de Série');
      return;
    }

    try {
      console.log('➕ Ajout d\'un nouvel équipement:', addEquipmentForm);

      const response = await fetch(`${API_URL}/api/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designation: addEquipmentForm.designation,
          cmu: addEquipmentForm.cmu,
          modele: addEquipmentForm.modele,
          marque: addEquipmentForm.marque,
          longueur: addEquipmentForm.longueur,
          numeroSerie: addEquipmentForm.numeroSerie,
          prixHT: addEquipmentForm.prixHT,
          etat: addEquipmentForm.etat,
          prochainVGP: addEquipmentForm.prochainVGP,
          certificat: addEquipmentForm.certificat,
          statut: 'Sur Parc' // Par défaut, nouveau matériel sur parc
        })
      });

      console.log('📡 Réponse HTTP:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Équipement ajouté:', result);

        await loadEquipments();
        setShowAddEquipmentModal(false);
        setAddEquipmentForm({
          designation: '',
          cmu: '',
          modele: '',
          marque: '',
          longueur: '',
          numeroSerie: '',
          prixHT: '',
          etat: '',
          prochainVGP: '',
          certificat: ''
        });
        alert('Équipement ajouté avec succès !');
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', response.status, errorText);
        alert(`Erreur lors de l'ajout: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      alert(`Erreur lors de l'ajout: ${error.message}`);
    }
  };

  // Fonctions existantes
  const handleDataImported = async (newData) => {
    setEquipmentData(newData);
    setShowImporter(false);
    
    localStorage.removeItem(STORAGE_KEY);
    
    alert(`${newData.length} équipements importés avec succès !`);
    
    try {
      const response = await fetch(`${API_URL}/api/equipment`);
      if (response.ok) {
        const freshData = await response.json();
        setEquipmentData(freshData);
        console.log('✅ Données rechargées depuis PostgreSQL');
      }
    } catch (err) {
      console.error('⚠️ Erreur rechargement:', err);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      setEquipmentData(initialData);
      localStorage.removeItem(STORAGE_KEY);
      alert('Données réinitialisées !');
    }
  };

  // Calcul des statistiques globales
  const stats = {
    total: equipmentData.length,
    enLocation: equipmentData.filter(eq => eq.statut === 'En Location').length,
    surParc: equipmentData.filter(eq => eq.statut === 'Sur Parc').length,
    enMaintenance: equipmentData.filter(eq => eq.statut === 'En Maintenance').length,
    enOffre: equipmentData.filter(eq => eq.statut === 'En Réservation').length
  };

  // Fonctions pour obtenir les classes de statut et d'état
  const getStatusClass = (status) => {
    switch (status) {
      case 'Sur Parc': return 'status-sur-parc';
      case 'En Location': return 'status-en-location';
      case 'En Maintenance': return 'status-en-maintenance';
      case 'En Réservation': return 'status-en-offre';
      default: return '';
    }
  };

  const getEtatClass = (etat) => {
    switch (etat) {
      case 'Bon': return 'etat-bon';
      case 'Moyen': return 'etat-moyen';
      case 'Vieillissant': return 'etat-vieillissant';
      case 'Neuf': return 'etat-neuf';
      default: return '';
    }
  };

  // Notes de mise à jour
  const ReleaseNotes = () => {
    const currentRelease = releaseNotes[0]; // La version la plus récente

    return (
      <div className="release-notes-overlay">
        <div className="release-notes-modal">
          <div className="release-notes-header">
            <h2>🚀 MagiLoc v{CURRENT_VERSION} - Notes de mise à jour</h2>
            <p>Nouvelles fonctionnalités et améliorations</p>
          </div>

          <div className="release-notes-content">
            {currentRelease.sections.map((section, index) => (
              <div key={index} className="release-section">
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="release-notes-footer">
            <button onClick={handleNotesAccepted} className="btn btn-primary btn-lg">
              Continuer vers l'application
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Écran d'authentification
  const LoginScreen = () => {
    const [localPassword, setLocalPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (localPassword === 'MAGILOC25') {
        localStorage.setItem(AUTH_KEY, 'true');
        setIsAuthenticated(true);
        setLocalError('');
      } else {
        setLocalError('Mot de passe incorrect');
        setLocalPassword('');
      }
    };

    return (
      <div className="login-overlay">
        <div className="login-modal">
          <div className="login-header">
            <h2>🔐 Authentification MagiLoc</h2>
            <p>Accès sécurisé au système de gestion</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="password">Mot de passe :</label>
              <input
                type="password"
                id="password"
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
                className={`form-input ${localError ? 'error' : ''}`}
                placeholder="Entrez le mot de passe"
                autoFocus
              />
              {localError && (
                <div className="error-message">{localError}</div>
              )}
            </div>
            
            <button type="submit" className="btn btn-primary btn-lg">
              Se connecter
            </button>
          </form>
          
          <div className="login-footer">
            <p>© 2025 MagiLoc - Gestion Parc Location COUERON</p>
          </div>
        </div>
      </div>
    );
  };

  // Navigation latérale avec déconnexion
  const Sidebar = () => (
    <div className="sidebar">
      <div className="logo-container">
        <h1 className="logo">
          <span className="logo-magi">MAGI</span>
          <span className="logo-loc">Loc</span>
        </h1>
      </div>

      <nav>
        <button
          onClick={() => handleNavigate('dashboard')}
          className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">TABLEAU DE BORD</span>
        </button>

        <button
          onClick={() => handleNavigate('sur-parc')}
          className={`nav-button ${currentPage === 'sur-parc' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏢</span>
          <span className="nav-text">SUR PARC</span>
          <span className="nav-badge">{stats.surParc}</span>
        </button>

        <button
          onClick={() => handleNavigate('en-offre')}
          className={`nav-button ${currentPage === 'en-offre' ? 'active' : ''}`}
        >
          <span className="nav-icon">💰</span>
          <span className="nav-text">RÉSERVATION</span>
          <span className="nav-badge">{stats.enOffre}</span>
        </button>

        <button
          onClick={() => handleNavigate('en-location')}
          className={`nav-button ${currentPage === 'en-location' ? 'active' : ''}`}
        >
          <span className="nav-icon">🚚</span>
          <span className="nav-text">LOCATION</span>
          <span className="nav-badge">{stats.enLocation}</span>
        </button>

        <button
          onClick={() => handleNavigate('maintenance')}
          className={`nav-button ${currentPage === 'maintenance' ? 'active' : ''}`}
        >
          <span className="nav-icon">🔧</span>
          <span className="nav-text">MAINTENANCE</span>
          <span className="nav-badge">{stats.enMaintenance}</span>
        </button>

        <button
          onClick={() => handleNavigate('planning')}
          className={`nav-button ${currentPage === 'planning' ? 'active' : ''}`}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-text">PLANNING</span>
        </button>

        <button
          onClick={() => handleNavigate('parc-loc')}
          className={`nav-button ${currentPage === 'parc-loc' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏭</span>
          <span className="nav-text">PARC LOC</span>
        </button>

        <button
          onClick={() => setShowNotesHistory(true)}
          className="nav-button"
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">NOTES MAJ</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );

  // Tableau de bord principal
  const Dashboard = () => (
    <div className="dashboard">
      <h1>Tableau de bord - Parc Location COUERON</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Équipements</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number primary">{stats.enLocation}</div>
          <div className="stat-label">En Location</div>
          <div className="stat-percentage primary">{stats.total > 0 ? ((stats.enLocation/stats.total)*100).toFixed(1) : 0}%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number success">{stats.surParc}</div>
          <div className="stat-label">Disponibles</div>
          <div className="stat-percentage success">{stats.total > 0 ? ((stats.surParc/stats.total)*100).toFixed(1) : 0}%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number danger">{stats.enMaintenance}</div>
          <div className="stat-label">En Maintenance</div>
          <div className="stat-percentage danger">{stats.total > 0 ? ((stats.enMaintenance/stats.total)*100).toFixed(1) : 0}%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number warning">{stats.enOffre}</div>
          <div className="stat-label">En Réservation</div>
          <div className="stat-percentage warning">{stats.total > 0 ? ((stats.enOffre/stats.total)*100).toFixed(1) : 0}%</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card alerts">
          <h3>⚠️ Alertes</h3>
          <div className="alert-item">
            <span className="alert-label">Retards de retour: </span>
            {equipmentData.filter(eq => eq.statut === 'En Location' && eq.finLocationTheorique).length}
          </div>
          <div className="alert-item">
            <span className="alert-label">VGP à prévoir: </span>
            {equipmentData.filter(eq => eq.prochainVGP).length}
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>🚀 Actions rapides</h3>
          <div className="actions-grid">
            <button
              onClick={() => setCurrentPage('en-location')}
              className="btn btn-primary"
            >
              Voir les locations en cours
            </button>
            <button
              onClick={() => setCurrentPage('maintenance')}
              className="btn btn-danger"
            >
              Gérer la maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Vue liste
  const ListView = () => (
    <EquipmentListView
      equipmentData={equipmentData}
      currentPage={currentPage}
      setSelectedEquipment={setSelectedEquipment}
      getStatusClass={getStatusClass}
      setShowImporter={setShowImporter}
      handleResetData={handleResetData}
      setShowAddEquipmentModal={setShowAddEquipmentModal}
    />
  );

  // Planning
  const Planning = () => (
    <div>
      <h1 className="page-title">Planning des locations</h1>
      <div className="planning-placeholder">
        <h3>Planning interactif</h3>
        <p>Cette fonctionnalité sera développée dans les prochaines étapes</p>
        <button
          onClick={() => setCurrentPage('en-location')}
          className="btn btn-primary"
        >
          Voir les locations en cours
        </button>
      </div>
    </div>
  );

  // Fonction pour calculer l'indicateur VGP dans la vue détaillée
  const getVGPDetailStatus = (prochainVGP) => {
    if (!prochainVGP) return { status: 'unknown', label: 'Non renseigné', icon: '❓', color: 'gray' };

    const today = new Date();
    const vgpDate = new Date(prochainVGP.split('/').reverse().join('-'));
    const diffTime = vgpDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        label: 'VGP DÉPASSÉ',
        subLabel: `Dépassé de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`,
        icon: '⚠️',
        color: 'red'
      };
    } else if (diffDays <= 30) {
      return {
        status: 'warning',
        label: 'VGP À PRÉVOIR',
        subLabel: `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`,
        icon: '❗',
        color: 'orange'
      };
    } else {
      return {
        status: 'valid',
        label: 'VGP À JOUR',
        subLabel: `Dans ${diffDays} jours`,
        icon: '✓',
        color: 'green'
      };
    }
  };

  // Vue détaillée
  const DetailView = () => {
    const vgpStatus = getVGPDetailStatus(selectedEquipment.prochainVGP);

    return (
    <div>
      <button
        onClick={() => setSelectedEquipment(null)}
        className="btn btn-gray"
        style={{ marginBottom: '20px' }}
      >
        ← Retour
      </button>
      
      <div className="detail-view">
        <div className="detail-header">
          <h2 className="detail-title">{selectedEquipment.designation} {selectedEquipment.cmu}</h2>
          <span className={`status-badge detail-status ${getStatusClass(selectedEquipment.statut)}`}>
            {selectedEquipment.statut}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Informations techniques</h3>
              {currentPage === 'parc-loc' && (
                <button
                  className="btn btn-sm"
                  onClick={handleOpenEditTechInfo}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Modifier les informations techniques"
                >
                  📜
                </button>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Modèle:</span>
              <span className="detail-value">{selectedEquipment.modele || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Marque:</span>
              <span className="detail-value">{selectedEquipment.marque || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Longueur:</span>
              <span className="detail-value">{selectedEquipment.longueur || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">N° Série:</span>
              <span className="detail-value serial-number">{selectedEquipment.numeroSerie}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Prix HT/J:</span>
              <span className="detail-value">{selectedEquipment.prixHT ? `${selectedEquipment.prixHT} €` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">État:</span>
              <span className={`detail-value ${getEtatClass(selectedEquipment.etat)}`}>
                {selectedEquipment.etat}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Infos:</span>
              <span className="detail-value">{selectedEquipment.infosComplementaires || 'N/A'}</span>
            </div>
          </div>

          {/* Section Location - affichée uniquement pour "En Réservation" et "En Location" */}
          {(selectedEquipment.statut === 'En Réservation' || selectedEquipment.statut === 'En Location') && (
            <div className="detail-section">
              <h3>Location</h3>
              <div className="detail-item">
                <span className="detail-label">Client:</span>
                <span className="detail-value">{selectedEquipment.client || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Début location:</span>
                <span className="detail-value">{selectedEquipment.debutLocation || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fin théorique:</span>
                <span className="detail-value">{selectedEquipment.finLocationTheorique || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">N° Offre:</span>
                <span className="detail-value">{selectedEquipment.numeroOffre || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Notes:</span>
                <span className="detail-value">{selectedEquipment.notesLocation || 'N/A'}</span>
              </div>
              {(() => {
                const businessDays = calculateBusinessDays(
                  selectedEquipment.debutLocation,
                  selectedEquipment.finLocationTheorique
                );
                const isLongDuration = businessDays && businessDays >= 21;
                const prixHT = selectedEquipment.prixHT ? parseFloat(selectedEquipment.prixHT) : null;

                return (
                  <>
                    {businessDays !== null && (
                      <div className="detail-item">
                        <span className="detail-label">Durée (jours ouvrés):</span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#2196F3' }}>
                          {businessDays} jour{businessDays > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {isLongDuration && (
                      <div className="detail-item" style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '8px', border: '2px solid #ff9800' }}>
                        <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ✅ Location Longue Durée:
                        </span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#f57c00' }}>
                          Remise 20% applicable
                          {prixHT && ` (${(prixHT * 0.8).toFixed(2)}€/j au lieu de ${prixHT}€/j)`}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Section Maintenance - affichée uniquement pour "En Maintenance" dans l'onglet Maintenance */}
          {selectedEquipment.statut === 'En Maintenance' && currentPage === 'maintenance' && (
            <div className="detail-section">
              <h3>🔧 Gestion Maintenance</h3>
              <div className="maintenance-panel">
                <div className="maintenance-motif-box">
                  <h4>📋 Motif de maintenance</h4>
                  <div className="motif-content">
                    {selectedEquipment.motifMaintenance || 'Aucun motif renseigné'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="vgp-section">
          <div className="vgp-section-header">
            <h3>Contrôles VGP</h3>
            <button
              onClick={() => {
                setCertificatInput(selectedEquipment.certificat || '');
                setShowCertificatModal(true);
              }}
              className="btn btn-secondary btn-sm"
            >
              📎 {selectedEquipment.certificat ? 'Modifier' : 'Ajouter'} certificat
            </button>
          </div>

          <div className="vgp-detail-grid">
            <div className="vgp-info-item">
              <span className="vgp-info-label">Certificat:</span>
              {getCertificatLink(selectedEquipment.certificat) ? (
                <a
                  href={getCertificatLink(selectedEquipment.certificat)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="certificat-link"
                >
                  {selectedEquipment.certificat} 🔗
                </a>
              ) : (
                <span className="vgp-info-value">{selectedEquipment.certificat || 'Non renseigné'}</span>
              )}
            </div>
          </div>

          {/* Indicateur VGP stylé */}
          <div className={`vgp-status-card vgp-status-${vgpStatus.color}`}>
            <div className="vgp-status-icon">{vgpStatus.icon}</div>
            <div className="vgp-status-content">
              <div className="vgp-status-label">{vgpStatus.label}</div>
              <div className="vgp-status-date">{selectedEquipment.prochainVGP || 'Non renseigné'}</div>
              <div className="vgp-status-sublabel">{vgpStatus.subLabel}</div>
            </div>
          </div>
        </div>

        {/* Boutons Historiques en dessous de la section VGP */}
        <div className="history-section" style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-lg"
            onClick={() => loadLocationHistory(selectedEquipment.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              color: 'white',
              border: 'none'
            }}
          >
            📜 Historique Locations
          </button>
          <button
            className="btn btn-lg"
            onClick={() => loadMaintenanceHistory(selectedEquipment.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              border: 'none'
            }}
          >
            🔧 Historique Maintenance
          </button>
        </div>

        <div className="actions-container">
          {selectedEquipment.statut === 'En Réservation' && (
            <button
              className="btn btn-success btn-lg"
              onClick={() => {
                setStartLocationDate('');
                setShowStartLocationModal(true);
              }}
            >
              🚀 Démarrer Location
            </button>
          )}
          {selectedEquipment.statut === 'En Location' && (
            <button
              className="btn btn-success btn-lg"
              onClick={() => {
                setReturnForm({ rentreeLe: '', noteRetour: '' });
                setShowReturnModal(true);
              }}
            >
              ✅ Effectuer le retour
            </button>
          )}
          {selectedEquipment.statut !== 'En Location' && selectedEquipment.statut !== 'En Maintenance' && (
            <button
              className="btn btn-warning btn-lg"
              onClick={() => setShowReservationModal(true)}
            >
              Créer une Réservation
            </button>
          )}
        </div>
      </div>
    </div>
    );
  };

  // Contenu principal selon la page
  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-message">{loadingMessage}</p>
          {retryCount > 0 && (
            <div className="loading-info">
              <p>💡 Le serveur gratuit se met en veille après 15 minutes.</p>
              <p>Il redémarre automatiquement, merci de patienter...</p>
            </div>
          )}
        </div>
      );
    }

    if (selectedEquipment) {
      return <DetailView />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'planning':
        return <Planning />;
      default:
        return <ListView />;
    }
  };

  // Modal d'ajout/modification de certificat
  const CertificatModal = () => (
    <div className="release-notes-overlay">
      <div className="certificat-modal">
        <div className="modal-header">
          <h2>📎 {selectedEquipment?.certificat ? 'Modifier' : 'Ajouter'} un certificat</h2>
          <button onClick={() => setShowCertificatModal(false)} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Vous pouvez saisir :
          </p>
          <ul className="modal-info-list">
            <li>Un <strong>numéro CML</strong> (ex: CML048065) pour générer automatiquement le lien VTIC</li>
            <li>Une <strong>URL Google Drive</strong> pour un certificat interne</li>
          </ul>

          <div className="form-group">
            <label htmlFor="certificat-input">Certificat ou URL :</label>
            <input
              id="certificat-input"
              type="text"
              value={certificatInput}
              onChange={(e) => setCertificatInput(e.target.value)}
              placeholder="Ex: CML048065 ou https://drive.google.com/..."
              className="form-input"
              autoFocus
            />
          </div>

          {certificatInput && getCertificatLink(certificatInput) && (
            <div className="preview-link">
              <span>🔗 Aperçu du lien : </span>
              <a href={getCertificatLink(certificatInput)} target="_blank" rel="noopener noreferrer">
                {getCertificatLink(certificatInput)}
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={() => setShowCertificatModal(false)} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSaveCertificat} className="btn btn-primary">
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de création de réservation (mémoïsé pour éviter les re-renders)
  const ReservationModal = useMemo(() => {
    if (!showReservationModal) return null;

    return (
      <div className="release-notes-overlay">
        <div className="reservation-modal">
          <div className="modal-header">
            <h2>📅 Créer une Réservation</h2>
            <button onClick={() => {
              setShowReservationModal(false);
              setReservationForm({
                client: '',
                debutLocation: '',
                finLocationTheorique: '',
                numeroOffre: '',
                notesLocation: ''
              });
            }} className="close-button">✕</button>
          </div>

          <div className="modal-content">
            <p className="modal-description">
              Remplissez les informations de réservation pour <strong>{selectedEquipment?.designation} {selectedEquipment?.cmu}</strong>
            </p>

            <div className="form-group">
              <label htmlFor="client-input">Client * :</label>
              <input
                id="client-input"
                type="text"
                value={reservationForm.client}
                onChange={(e) => setReservationForm({...reservationForm, client: e.target.value})}
                placeholder="Nom du client"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="debut-location-input">Début Location :</label>
              <input
                id="debut-location-input"
                type="date"
                value={reservationForm.debutLocation}
                onChange={(e) => setReservationForm({...reservationForm, debutLocation: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fin-location-input">Fin Théorique :</label>
              <input
                id="fin-location-input"
                type="date"
                value={reservationForm.finLocationTheorique}
                onChange={(e) => setReservationForm({...reservationForm, finLocationTheorique: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero-offre-input">N° Offre :</label>
              <input
                id="numero-offre-input"
                type="text"
                value={reservationForm.numeroOffre}
                onChange={(e) => setReservationForm({...reservationForm, numeroOffre: e.target.value})}
                placeholder="Ex: OFF-2025-001"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes-input">Notes :</label>
              <textarea
                id="notes-input"
                value={reservationForm.notesLocation}
                onChange={(e) => setReservationForm({...reservationForm, notesLocation: e.target.value})}
                placeholder="Notes complémentaires..."
                className="form-input"
                rows="4"
              />
            </div>

            <p className="modal-info">
              <small>* Champ obligatoire</small>
            </p>
          </div>

          <div className="modal-footer">
            <button onClick={() => {
              setShowReservationModal(false);
              setReservationForm({
                client: '',
                debutLocation: '',
                finLocationTheorique: '',
                numeroOffre: '',
                notesLocation: ''
              });
            }} className="btn btn-gray">
              Annuler
            </button>
            <button onClick={handleCreateReservation} className="btn btn-primary">
              ✅ Valider la Réservation
            </button>
          </div>
        </div>
      </div>
    );
  }, [showReservationModal, selectedEquipment, reservationForm]);

  // Modal de démarrage de location (mémoïsé)
  const StartLocationModal = useMemo(() => {
    if (!showStartLocationModal) return null;

    // Définir la date par défaut à aujourd'hui
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="release-notes-overlay">
        <div className="reservation-modal">
          <div className="modal-header">
            <h2>🚀 Démarrer la Location</h2>
            <button onClick={() => {
              setShowStartLocationModal(false);
              setStartLocationDate('');
            }} className="close-button">✕</button>
          </div>

          <div className="modal-content">
            <p className="modal-description">
              Démarrage de la location pour <strong>{selectedEquipment?.designation} {selectedEquipment?.cmu}</strong>
            </p>

            <div className="form-group">
              <label htmlFor="start-date-input">Date de début de location * :</label>
              <input
                id="start-date-input"
                type="date"
                value={startLocationDate || today}
                onChange={(e) => setStartLocationDate(e.target.value)}
                className="form-input"
              />
            </div>

            <p className="modal-info">
              <small>Cette action passera le matériel en statut "En Location"</small>
            </p>
          </div>

          <div className="modal-footer">
            <button onClick={() => {
              setShowStartLocationModal(false);
              setStartLocationDate('');
            }} className="btn btn-gray">
              Annuler
            </button>
            <button onClick={handleStartLocation} className="btn btn-success">
              ✅ Démarrer la Location
            </button>
          </div>
        </div>
      </div>
    );
  }, [showStartLocationModal, selectedEquipment, startLocationDate]);

  // Modal de retour (mémoïsé)
  const ReturnModal = useMemo(() => {
    if (!showReturnModal) return null;

    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="release-notes-overlay">
        <div className="reservation-modal">
          <div className="modal-header">
            <h2>✅ Effectuer le Retour</h2>
            <button onClick={() => {
              setShowReturnModal(false);
              setReturnForm({ rentreeLe: '', noteRetour: '' });
            }} className="close-button">✕</button>
          </div>

          <div className="modal-content">
            <p className="modal-description">
              Retour de location pour <strong>{selectedEquipment?.designation} {selectedEquipment?.cmu}</strong>
            </p>

            <div className="form-group">
              <label htmlFor="rentre-le-input">Date de retour * :</label>
              <input
                id="rentre-le-input"
                type="date"
                value={returnForm.rentreeLe || today}
                onChange={(e) => setReturnForm({...returnForm, rentreeLe: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="note-retour-input">Note de retour :</label>
              <textarea
                id="note-retour-input"
                value={returnForm.noteRetour}
                onChange={(e) => setReturnForm({...returnForm, noteRetour: e.target.value})}
                placeholder="Problèmes constatés, points à vérifier..."
                className="form-input"
                rows="4"
              />
            </div>

            <p className="modal-info">
              <small>⚠️ Le matériel passera en statut "En Maintenance" avec le motif "Retour Location, à vérifier"</small>
            </p>
          </div>

          <div className="modal-footer">
            <button onClick={() => {
              setShowReturnModal(false);
              setReturnForm({ rentreeLe: '', noteRetour: '' });
            }} className="btn btn-gray">
              Annuler
            </button>
            <button onClick={handleReturn} className="btn btn-success">
              ✅ Valider le Retour
            </button>
          </div>
        </div>
      </div>
    );
  }, [showReturnModal, selectedEquipment, returnForm]);

  // Modal historique locations
  const LocationHistoryModal = useMemo(() => {
    if (!showLocationHistory) return null;

    return (
      <div className="release-notes-overlay">
        <div className="reservation-modal" style={{ maxWidth: '900px' }}>
          <div className="modal-header">
            <h2>📜 Historique des Locations</h2>
            <button onClick={() => setShowLocationHistory(false)} className="close-button">✕</button>
          </div>

          <div className="modal-content">
            {locationHistory.length === 0 ? (
              <p className="history-empty">
                📋 Aucun historique de location pour cet équipement
              </p>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Début</th>
                      <th>Retour réel</th>
                      <th>Durée</th>
                      <th>CA HT</th>
                      <th>N° Offre</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationHistory.map((loc, index) => {
                      const hasCA = loc.ca_total_ht && loc.duree_jours_ouvres && loc.prix_ht_jour;
                      const caDetail = hasCA
                        ? `${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€/j${loc.remise_ld ? ' - 20% (LD)' : ''}`
                        : '';

                      return (
                        <tr key={index}>
                          <td className="history-client-name">{loc.client || 'N/A'}</td>
                          <td>{loc.date_debut ? new Date(loc.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</td>
                          <td>{loc.date_retour_reel ? new Date(loc.date_retour_reel).toLocaleDateString('fr-FR') : 'N/A'}</td>
                          <td>
                            {loc.duree_jours_ouvres ? (
                              <span className="history-duration">{loc.duree_jours_ouvres} j</span>
                            ) : 'N/A'}
                          </td>
                          <td>
                            {hasCA ? (
                              <div className="history-ca-container">
                                <span className="history-ca-amount">
                                  {parseFloat(loc.ca_total_ht).toFixed(2)}€
                                </span>
                                <span className="history-ca-detail">
                                  {caDetail}
                                </span>
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td>{loc.numero_offre || '-'}</td>
                          <td>
                            {loc.note_retour ? (
                              <div className="history-note">{loc.note_retour}</div>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button onClick={() => setShowLocationHistory(false)} className="btn btn-gray">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }, [showLocationHistory, locationHistory]);

  // Modal historique maintenance
  const MaintenanceHistoryModal = useMemo(() => {
    if (!showMaintenanceHistory) return null;

    return (
      <div className="release-notes-overlay">
        <div className="reservation-modal" style={{ maxWidth: '900px' }}>
          <div className="modal-header">
            <h2>🔧 Historique de Maintenance</h2>
            <button onClick={() => setShowMaintenanceHistory(false)} className="close-button">✕</button>
          </div>

          <div className="modal-content">
            {maintenanceHistory.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Aucun historique de maintenance pour cet équipement
              </p>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Entrée</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Sortie</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Motif</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Note retour</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Travaux</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceHistory.map((maint, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>
                          {maint.date_entree ? new Date(maint.date_entree).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {maint.date_sortie ? new Date(maint.date_sortie).toLocaleDateString('fr-FR') : 'En cours'}
                        </td>
                        <td style={{ padding: '12px' }}>{maint.motif_maintenance || 'N/A'}</td>
                        <td style={{ padding: '12px', fontSize: '0.9em', fontStyle: 'italic', color: '#ff6b6b' }}>
                          {maint.note_retour || '-'}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9em' }}>
                          {maint.travaux_effectues || 'Non renseigné'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button onClick={() => setShowMaintenanceHistory(false)} className="btn btn-gray">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }, [showMaintenanceHistory, maintenanceHistory]);

  // Modal d'édition des informations techniques
  const EditTechInfoModal = useMemo(() => {
    if (!showEditTechInfoModal) return null;

    return (
      <div className="release-notes-overlay">
        <div className="reservation-modal">
          <div className="modal-header">
            <h2>📜 Modifier les Informations Techniques</h2>
            <button onClick={() => {
              setShowEditTechInfoModal(false);
              setTechInfoForm({
                modele: '',
                marque: '',
                longueur: '',
                numeroSerie: '',
                prixHT: '',
                etat: ''
              });
            }} className="close-button">✕</button>
          </div>

          <div className="modal-content">
            <p className="modal-description">
              Modification des informations techniques pour <strong>{selectedEquipment?.designation} {selectedEquipment?.cmu}</strong>
            </p>

            <div className="form-group">
              <label htmlFor="modele-input">Modèle :</label>
              <input
                id="modele-input"
                type="text"
                value={techInfoForm.modele}
                onChange={(e) => setTechInfoForm({...techInfoForm, modele: e.target.value})}
                placeholder="Modèle"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="marque-input">Marque :</label>
              <input
                id="marque-input"
                type="text"
                value={techInfoForm.marque}
                onChange={(e) => setTechInfoForm({...techInfoForm, marque: e.target.value})}
                placeholder="Marque"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longueur-input">Longueur :</label>
              <input
                id="longueur-input"
                type="text"
                value={techInfoForm.longueur}
                onChange={(e) => setTechInfoForm({...techInfoForm, longueur: e.target.value})}
                placeholder="Ex: 14m"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero-serie-input">N° Série :</label>
              <input
                id="numero-serie-input"
                type="text"
                value={techInfoForm.numeroSerie}
                onChange={(e) => setTechInfoForm({...techInfoForm, numeroSerie: e.target.value})}
                placeholder="Numéro de série"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prix-ht-input">Prix HT/J :</label>
              <input
                id="prix-ht-input"
                type="number"
                step="0.01"
                value={techInfoForm.prixHT}
                onChange={(e) => setTechInfoForm({...techInfoForm, prixHT: e.target.value})}
                placeholder="Ex: 150.00"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="etat-input">État :</label>
              <select
                id="etat-input"
                value={techInfoForm.etat}
                onChange={(e) => setTechInfoForm({...techInfoForm, etat: e.target.value})}
                className="form-input"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Neuf">Neuf</option>
                <option value="Bon">Bon</option>
                <option value="Moyen">Moyen</option>
                <option value="Vieillissant">Vieillissant</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={() => {
              setShowEditTechInfoModal(false);
              setTechInfoForm({
                modele: '',
                marque: '',
                longueur: '',
                numeroSerie: '',
                prixHT: '',
                etat: ''
              });
            }} className="btn btn-gray">
              Annuler
            </button>
            <button onClick={handleSaveTechInfo} className="btn btn-primary">
              💾 Sauvegarder
            </button>
          </div>
        </div>
      </div>
    );
  }, [showEditTechInfoModal, selectedEquipment, techInfoForm]);

  // Modal d'ajout d'équipement
  const AddEquipmentModal = useMemo(() => {
    if (!showAddEquipmentModal) return null;

    return (
      <div className="release-notes-overlay">
        <div className="reservation-modal" style={{ maxWidth: '800px' }}>
          <div className="modal-header">
            <h2>➕ Ajouter un Nouvel Équipement</h2>
            <button onClick={() => {
              setShowAddEquipmentModal(false);
              setAddEquipmentForm({
                designation: '',
                cmu: '',
                modele: '',
                marque: '',
                longueur: '',
                numeroSerie: '',
                prixHT: '',
                etat: '',
                prochainVGP: '',
                certificat: ''
              });
            }} className="close-button">✕</button>
          </div>

          <div className="modal-content">
            <p className="modal-description">
              Remplissez les informations du nouveau matériel
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="designation-input">Désignation * :</label>
                <input
                  id="designation-input"
                  type="text"
                  value={addEquipmentForm.designation}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, designation: e.target.value})}
                  placeholder="Ex: PALAN ELECTRIQUE"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cmu-input">CMU :</label>
                <input
                  id="cmu-input"
                  type="text"
                  value={addEquipmentForm.cmu}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, cmu: e.target.value})}
                  placeholder="Ex: 1T"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modele-add-input">Modèle :</label>
                <input
                  id="modele-add-input"
                  type="text"
                  value={addEquipmentForm.modele}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, modele: e.target.value})}
                  placeholder="Modèle"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="marque-add-input">Marque :</label>
                <input
                  id="marque-add-input"
                  type="text"
                  value={addEquipmentForm.marque}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, marque: e.target.value})}
                  placeholder="Marque"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="longueur-add-input">Longueur :</label>
                <input
                  id="longueur-add-input"
                  type="text"
                  value={addEquipmentForm.longueur}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, longueur: e.target.value})}
                  placeholder="Ex: 14m"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="numero-serie-add-input">N° Série * :</label>
                <input
                  id="numero-serie-add-input"
                  type="text"
                  value={addEquipmentForm.numeroSerie}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, numeroSerie: e.target.value})}
                  placeholder="Numéro de série"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prix-ht-add-input">Prix HT/J :</label>
                <input
                  id="prix-ht-add-input"
                  type="number"
                  step="0.01"
                  value={addEquipmentForm.prixHT}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, prixHT: e.target.value})}
                  placeholder="Ex: 150.00"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="etat-add-input">État :</label>
                <select
                  id="etat-add-input"
                  value={addEquipmentForm.etat}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, etat: e.target.value})}
                  className="form-input"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Neuf">Neuf</option>
                  <option value="Bon">Bon</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Vieillissant">Vieillissant</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prochain-vgp-add-input">Prochain VGP :</label>
                <input
                  id="prochain-vgp-add-input"
                  type="text"
                  value={addEquipmentForm.prochainVGP}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, prochainVGP: e.target.value})}
                  placeholder="JJ/MM/AAAA"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="certificat-add-input">Certificat :</label>
                <input
                  id="certificat-add-input"
                  type="text"
                  value={addEquipmentForm.certificat}
                  onChange={(e) => setAddEquipmentForm({...addEquipmentForm, certificat: e.target.value})}
                  placeholder="N° de certificat"
                  className="form-input"
                />
              </div>
            </div>

            <p className="modal-info">
              <small>* Champs obligatoires</small>
            </p>
          </div>

          <div className="modal-footer">
            <button onClick={() => {
              setShowAddEquipmentModal(false);
              setAddEquipmentForm({
                designation: '',
                cmu: '',
                modele: '',
                marque: '',
                longueur: '',
                numeroSerie: '',
                prixHT: '',
                etat: '',
                prochainVGP: '',
                certificat: ''
              });
            }} className="btn btn-gray">
              Annuler
            </button>
            <button onClick={handleAddEquipment} className="btn btn-primary">
              ➕ Ajouter l'Équipement
            </button>
          </div>
        </div>
      </div>
    );
  }, [showAddEquipmentModal, addEquipmentForm]);

  // Rendu conditionnel selon l'état
  if (showReleaseNotes) {
    return <ReleaseNotes />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Application principale
  return (
    <>
      <div className="app">
        <Sidebar />

        <div className="main-content">
          {showImporter && (
            <div style={{ marginBottom: '20px' }}>
              <CSVImporter onDataImported={handleDataImported} />
            </div>
          )}

          {renderMainContent()}
        </div>

        {showNotesHistory && (
          <ReleaseNotesHistory onClose={() => setShowNotesHistory(false)} />
        )}

        {showCertificatModal && <CertificatModal />}
        {ReservationModal}
        {StartLocationModal}
        {ReturnModal}
        {LocationHistoryModal}
        {MaintenanceHistoryModal}
        {EditTechInfoModal}
        {AddEquipmentModal}
      </div>
      <Analytics />
    </>
  );
}

export default App;
