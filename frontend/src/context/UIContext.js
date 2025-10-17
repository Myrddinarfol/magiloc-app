import React, { createContext, useState } from 'react';
import { VERSION_KEY, STORAGE_KEY } from '../config/constants';
import { hasNewVersion } from '../data/releaseNotes';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // Navigation et UI
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [previousPage, setPreviousPage] = useState(null); // Pour le breadcrumb/retour
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Sous-menus collapsibles
  const [expandedMenus, setExpandedMenus] = useState({
    location: false,
    maintenance: false
  });

  // Modals
  const [showImporter, setShowImporter] = useState(false);
  const [showCertificatModal, setShowCertificatModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showStartLocationModal, setShowStartLocationModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(false);
  const [showEditTechInfoModal, setShowEditTechInfoModal] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showNotesHistory, setShowNotesHistory] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCompleteMaintenance, setShowCompleteMaintenance] = useState(false);

  // Notifications toast
  const [toasts, setToasts] = useState([]);

  // Filtre pour les équipements (modèles)
  const [equipmentFilter, setEquipmentFilter] = useState(null);

  // Données de maintenance (pour passer les notes de retour vers la fiche de maintenance)
  const [maintenanceData, setMaintenanceData] = useState({
    motif: '',
    noteRetour: ''
  });

  // Release Notes
  const [showReleaseNotes, setShowReleaseNotes] = useState(() => {
    const lastSeenVersion = localStorage.getItem(VERSION_KEY);
    return hasNewVersion(lastSeenVersion);
  });

  // Fonction pour gérer la navigation (ferme la fiche détaillée automatiquement)
  const handleNavigate = (page) => {
    setSelectedEquipment(null);
    setPreviousPage(currentPage); // Mémoriser la page actuelle avant de naviguer
    setCurrentPage(page);
  };

  // Fonction pour naviguer vers une fiche détaillée (mémorise d'où on vient)
  const handleOpenEquipmentDetail = (equipment, fromPage) => {
    setPreviousPage(fromPage || currentPage); // Mémoriser la page d'origine
    setSelectedEquipment(equipment);
    // Ne pas changer la page - la fiche s'affiche par-dessus la page actuelle
  };

  // Fonction pour retourner à la page précédente
  const handleGoBack = () => {
    setSelectedEquipment(null);
    // Si on avait mémorisé une page différente, on y retourne
    if (previousPage && previousPage !== currentPage) {
      setCurrentPage(previousPage);
    }
    setPreviousPage(null);
  };

  // Fonction pour toggle les sous-menus
  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Réinitialiser les données
  const handleResetData = (setEquipmentData) => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      // Les données viennent maintenant de PostgreSQL, pas du localStorage
      // Cette fonction pourrait être supprimée ou adaptée pour vider la base
      localStorage.removeItem(STORAGE_KEY);
      showToast('Cache local vidé ! Rechargez la page pour récupérer les données depuis le serveur.', 'info');
    }
  };

  // Fonction pour afficher un toast
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    // Auto-suppression après 4 secondes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <UIContext.Provider value={{
      currentPage,
      setCurrentPage,
      previousPage,
      setPreviousPage,
      selectedEquipment,
      setSelectedEquipment,
      showImporter,
      setShowImporter,
      showCertificatModal,
      setShowCertificatModal,
      showReservationModal,
      setShowReservationModal,
      showStartLocationModal,
      setShowStartLocationModal,
      showReturnModal,
      setShowReturnModal,
      showLocationHistory,
      setShowLocationHistory,
      showMaintenanceHistory,
      setShowMaintenanceHistory,
      showEditTechInfoModal,
      setShowEditTechInfoModal,
      showAddEquipmentModal,
      setShowAddEquipmentModal,
      showNotesHistory,
      setShowNotesHistory,
      showMaintenanceModal,
      setShowMaintenanceModal,
      showCompleteMaintenance,
      setShowCompleteMaintenance,
      showReleaseNotes,
      setShowReleaseNotes,
      handleNavigate,
      handleOpenEquipmentDetail,
      handleGoBack,
      handleResetData,
      expandedMenus,
      toggleMenu,
      toasts,
      showToast,
      equipmentFilter,
      setEquipmentFilter,
      maintenanceData,
      setMaintenanceData
    }}>
      {children}
    </UIContext.Provider>
  );
};
