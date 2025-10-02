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
          onClick={() => setShowImporter(!showImporter)}
          className="import-button"
        >
          📁 Importer CSV
        </button>

        <button
          onClick={handleResetData}
          className="reset-button"
        >
          🔄 Réinitialiser
        </button>

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
            <h3>Informations techniques</h3>
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

          <div className="detail-section">
            <h3>Location & Maintenance</h3>
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
              <span className="detail-label">Rentré le:</span>
              <span className="detail-value">{selectedEquipment.rentreeLe || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">N° Offre:</span>
              <span className="detail-value">{selectedEquipment.numeroOffre || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Notes:</span>
              <span className="detail-value">{selectedEquipment.notesLocation || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Motif maintenance:</span>
              <span className="detail-value">{selectedEquipment.motifMaintenance || 'N/A'}</span>
            </div>
            {selectedEquipment.statut === 'En Maintenance' && selectedEquipment.noteRetour && (
              <div className="detail-item">
                <span className="detail-label">Note de retour:</span>
                <span className="detail-value" style={{ fontStyle: 'italic', color: '#ff6b6b' }}>
                  {selectedEquipment.noteRetour}
                </span>
              </div>
            )}
          </div>
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
            <div className="vgp-info-item">
              <span className="vgp-info-label">Dernier VGP:</span>
              <span className="vgp-info-value">{selectedEquipment.dernierVGP || 'N/A'}</span>
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

        {/* Section Historiques */}
        <div className="history-section" style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => loadLocationHistory(selectedEquipment.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            📜 Historique Locations
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => loadMaintenanceHistory(selectedEquipment.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
          <button className="btn btn-primary btn-lg">
            Modifier
          </button>
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
              <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Aucun historique de location pour cet équipement
              </p>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Client</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Début</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Fin prévue</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Retour réel</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>N° Offre</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationHistory.map((loc, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{loc.client || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{loc.date_debut || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{loc.date_fin || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{loc.date_retour_reel || loc.rentre_le || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{loc.numero_offre || 'N/A'}</td>
                        <td style={{ padding: '12px', fontSize: '0.9em', fontStyle: 'italic', color: '#ff6b6b' }}>
                          {loc.note_retour || '-'}
                        </td>
                      </tr>
                    ))}
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
      </div>
      <Analytics />
    </>
  );
}

export default App;
