import React, { useState, useEffect } from 'react';
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
  const [loadingMessage, setLoadingMessage] = useState('Chargement des données...');
  const [retryCount, setRetryCount] = useState(0);

  // Chargement des données depuis l'API avec retry automatique
  useEffect(() => {
    const MAX_RETRIES = 12; // 12 tentatives = 60 secondes
    const RETRY_DELAY = 5000; // 5 secondes entre chaque tentative

    const loadEquipments = async (attemptNumber = 1) => {
      try {
        console.log(`🔍 Tentative ${attemptNumber}/${MAX_RETRIES} - Chargement depuis:`, `${API_URL}/api/equipment`);

        // Message dynamique selon la tentative
        if (attemptNumber === 1) {
          setLoadingMessage('Chargement des données...');
        } else if (attemptNumber <= 3) {
          setLoadingMessage('⏳ Le serveur démarre... (peut prendre 30 secondes)');
        } else {
          setLoadingMessage(`🔄 Nouvelle tentative ${attemptNumber}/${MAX_RETRIES}...`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

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
          return; // Succès, on arrête
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Erreur tentative ${attemptNumber}:`, error.message);

        // Si on n'a pas atteint le max de retries, on réessaye
        if (attemptNumber < MAX_RETRIES) {
          setRetryCount(attemptNumber);
          setTimeout(() => {
            loadEquipments(attemptNumber + 1);
          }, RETRY_DELAY);
        } else {
          // Max retries atteint
          console.error('💥 Échec après', MAX_RETRIES, 'tentatives');
          setLoadingMessage('❌ Impossible de charger les données. Le serveur ne répond pas.');
          setEquipmentData([]);
          setIsLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      setIsLoading(true);
      loadEquipments();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, API_URL]);

  // Gestion des notes de mise à jour
  const handleNotesAccepted = () => {
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    setShowReleaseNotes(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
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
    enOffre: equipmentData.filter(eq => eq.statut === 'En Offre de Prix').length
  };

  // Fonctions pour obtenir les classes de statut et d'état
  const getStatusClass = (status) => {
    switch (status) {
      case 'Sur Parc': return 'status-sur-parc';
      case 'En Location': return 'status-en-location';
      case 'En Maintenance': return 'status-en-maintenance';
      case 'En Offre de Prix': return 'status-en-offre';
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
          onClick={() => setCurrentPage('dashboard')}
          className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">TABLEAU DE BORD</span>
        </button>

        <button
          onClick={() => setCurrentPage('sur-parc')}
          className={`nav-button ${currentPage === 'sur-parc' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏢</span>
          <span className="nav-text">SUR PARC</span>
          <span className="nav-badge">{stats.surParc}</span>
        </button>

        <button
          onClick={() => setCurrentPage('en-offre')}
          className={`nav-button ${currentPage === 'en-offre' ? 'active' : ''}`}
        >
          <span className="nav-icon">💰</span>
          <span className="nav-text">OFFRE DE PRIX</span>
          <span className="nav-badge">{stats.enOffre}</span>
        </button>

        <button
          onClick={() => setCurrentPage('en-location')}
          className={`nav-button ${currentPage === 'en-location' ? 'active' : ''}`}
        >
          <span className="nav-icon">🚚</span>
          <span className="nav-text">LOCATION</span>
          <span className="nav-badge">{stats.enLocation}</span>
        </button>

        <button
          onClick={() => setCurrentPage('maintenance')}
          className={`nav-button ${currentPage === 'maintenance' ? 'active' : ''}`}
        >
          <span className="nav-icon">🔧</span>
          <span className="nav-text">MAINTENANCE</span>
          <span className="nav-badge">{stats.enMaintenance}</span>
        </button>

        <button
          onClick={() => setCurrentPage('planning')}
          className={`nav-button ${currentPage === 'planning' ? 'active' : ''}`}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-text">PLANNING</span>
        </button>

        <button
          onClick={() => setCurrentPage('parc-loc')}
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
          <div className="stat-label">En Offre</div>
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

        <div className="actions-container">
          {selectedEquipment.statut === 'En Location' && (
            <button className="btn btn-success btn-lg">
              Effectuer le retour
            </button>
          )}
          <button className="btn btn-primary btn-lg">
            Modifier
          </button>
          <button className="btn btn-warning btn-lg">
            Créer une offre
          </button>
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
      </div>
      <Analytics />
    </>
  );
}

export default App;
