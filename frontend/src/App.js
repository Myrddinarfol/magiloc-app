import React, { useState, useEffect } from 'react';
import { equipmentData as initialData } from './data/equipments';
import CSVImporter from './components/CSVImporter';
import './App.css';

function App() {
  // Clés pour le stockage local
  const STORAGE_KEY = 'magiloc-equipment-data';
  const AUTH_KEY = 'magiloc-authenticated';
  const NOTES_KEY = 'magiloc-notes-seen';

  // États
  const [showReleaseNotes, setShowReleaseNotes] = useState(() => !localStorage.getItem(NOTES_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [equipmentData, setEquipmentData] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showImporter, setShowImporter] = useState(false);

  // Récupération de l'API backend
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL;

    fetch(`${API_URL}/equipments`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setEquipmentData(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } else {
          console.log("⚠️ Aucune donnée backend, fallback local");
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            setEquipmentData(JSON.parse(savedData));
          } else {
            setEquipmentData(initialData);
          }
        }
      })
      .catch((err) => {
        console.error("❌ Erreur API :", err);
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          setEquipmentData(JSON.parse(savedData));
        } else {
          setEquipmentData(initialData);
        }
      });
  }, []);

  // Sauvegarde auto dans localStorage quand equipmentData change
  useEffect(() => {
    if (equipmentData.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equipmentData));
    }
  }, [equipmentData]);

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

  // Notes de mise à jour
  const handleNotesAccepted = () => {
    localStorage.setItem(NOTES_KEY, 'true');
    setShowReleaseNotes(false);
  };

  // Import CSV
  const handleDataImported = (newData) => {
    setEquipmentData(newData);
    setShowImporter(false);
    alert(`${newData.length} équipements importés avec succès !`);
  };

  // Réinitialisation des données
  const handleResetData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) {
      setEquipmentData(initialData);
      localStorage.removeItem(STORAGE_KEY);
      alert('Données réinitialisées !');
    }
  };

  // Calcul stats
  const stats = {
    total: equipmentData.length,
    enLocation: equipmentData.filter(eq => eq.disponibilite === 'En Location').length,
    surParc: equipmentData.filter(eq => eq.disponibilite === 'Sur Parc').length,
    enMaintenance: equipmentData.filter(eq => eq.disponibilite === 'En Maintenance').length,
    enOffre: equipmentData.filter(eq => eq.disponibilite === 'En Offre de Prix').length
  };

  // Fonctions utilitaires (getStatusClass, getEtatClass, getFilteredData, etc.)
  // 👉 garde exactement tes fonctions actuelles, je ne les recopie pas ici pour alléger
  // mais elles restent identiques (getStatusClass, getEtatClass, getFilteredData, etc.)

  // ---- puis tout ton code UI existant (ReleaseNotes, LoginScreen, Sidebar, Dashboard, ListView, Planning, DetailView...) ----
  // 👉 tu peux les laisser tels quels, je n’ai pas touché à la partie affichage.
  // La seule différence est que `equipmentData` est maintenant rempli via ton backend si dispo.

  // Rendu conditionnel
  if (showReleaseNotes) return <ReleaseNotes />;
  if (!isAuthenticated) return <LoginScreen />;

  return (
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
    </div>
  );
}

export default App;
