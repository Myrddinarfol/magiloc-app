import React, { useState, useEffect } from 'react';
import CSVImporter from './components/CSVImporter';
import './App.css';

function App() {
  // Clés pour l’authentification et notes
  const AUTH_KEY = 'magiloc-authenticated';
  const NOTES_KEY = 'magiloc-notes-seen';
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // États
  const [showReleaseNotes, setShowReleaseNotes] = useState(() => {
    return !localStorage.getItem(NOTES_KEY);
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [equipmentData, setEquipmentData] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des données depuis l’API
  useEffect(() => {
    const loadEquipments = async () => {
      try {
        console.log('🔍 Chargement depuis:', `${API_URL}/api/equipment`);
        const response = await fetch(`${API_URL}/api/equipment`);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Données reçues:', data.length, 'équipements');
          setEquipmentData(data);
        } else {
          console.error('⚠️ Backend inaccessible');
          setEquipmentData([]);
        }
      } catch (error) {
        console.error('❌ Erreur API:', error);
        setEquipmentData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadEquipments();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, API_URL]);

  // Gestion des notes de mise à jour
  const handleNotesAccepted = () => {
    localStorage.setItem(NOTES_KEY, 'true');
    setShowReleaseNotes(false);
  };

  // Authentification
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'MAGILOC25') {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Mot de passe incorrect');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  // Import CSV → recharge depuis API
  const handleDataImported = async (newData) => {
    setEquipmentData(newData);
    setShowImporter(false);

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
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.'
      )
    ) {
      setEquipmentData([]);
      alert('Données réinitialisées !');
    }
  };

  // Stats globales
  const stats = {
    total: equipmentData.length,
    enLocation: equipmentData.filter((eq) => eq.disponibilite === 'En Location').length,
    surParc: equipmentData.filter((eq) => eq.disponibilite === 'Sur Parc').length,
    enMaintenance: equipmentData.filter((eq) => eq.disponibilite === 'En Maintenance').length,
    enOffre: equipmentData.filter((eq) => eq.disponibilite === 'En Offre de Prix').length,
  };

  // Fonctions utilitaires
  const getStatusClass = (status) => {
    switch (status) {
      case 'Sur Parc':
        return 'status-sur-parc';
      case 'En Location':
        return 'status-en-location';
      case 'En Maintenance':
        return 'status-en-maintenance';
      case 'En Offre de Prix':
        return 'status-en-offre';
      default:
        return '';
    }
  };

  const getEtatClass = (etat) => {
    switch (etat) {
      case 'Bon':
        return 'etat-bon';
      case 'Moyen':
        return 'etat-moyen';
      case 'Vieillissant':
        return 'etat-vieillissant';
      case 'Neuf':
        return 'etat-neuf';
      default:
        return '';
    }
  };

  // Release Notes
  const ReleaseNotes = () => (
    <div className="release-notes-overlay">
      <div className="release-notes-modal">
        <div className="release-notes-header">
          <h2>🚀 MagiLoc v1.0 - Notes de mise à jour</h2>
        </div>
        <div className="release-notes-footer">
          <button onClick={handleNotesAccepted} className="btn btn-primary btn-lg">
            Continuer vers l'application
          </button>
        </div>
      </div>
    </div>
  );

  // Écran d’authentification
  const LoginScreen = () => (
    <div className="login-overlay">
      <div className="login-modal">
        <h2>🔐 Authentification MagiLoc</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
          />
          {passwordError && <div className="error-message">{passwordError}</div>}
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );

  // Rendu principal
  if (showReleaseNotes) return <ReleaseNotes />;
  if (!isAuthenticated) return <LoginScreen />;

  return (
    <div className="app">
      <div className="main-content">
        {showImporter && (
          <div style={{ marginBottom: '20px' }}>
            <CSVImporter onDataImported={handleDataImported} />
          </div>
        )}
        {isLoading ? (
          <p>Chargement des données...</p>
        ) : (
          <p>✅ {equipmentData.length} équipements chargés</p>
        )}
      </div>
    </div>
  );
}

export default App;
