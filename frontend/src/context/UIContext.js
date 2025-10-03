import React, { createContext, useState } from 'react';
import { VERSION_KEY, STORAGE_KEY } from '../config/constants';
import { hasNewVersion } from '../data/releaseNotes';
import { equipmentData as initialData } from '../data/equipments';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // Navigation et UI
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEquipment, setSelectedEquipment] = useState(null);

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

  // Release Notes
  const [showReleaseNotes, setShowReleaseNotes] = useState(() => {
    const lastSeenVersion = localStorage.getItem(VERSION_KEY);
    return hasNewVersion(lastSeenVersion);
  });

  // Fonction pour gérer la navigation (ferme la fiche détaillée automatiquement)
  const handleNavigate = (page) => {
    setSelectedEquipment(null);
    setCurrentPage(page);
  };

  // Réinitialiser les données
  const handleResetData = (setEquipmentData) => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      setEquipmentData(initialData);
      localStorage.removeItem(STORAGE_KEY);
      alert('Données réinitialisées !');
    }
  };

  return (
    <UIContext.Provider value={{
      currentPage,
      setCurrentPage,
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
      showReleaseNotes,
      setShowReleaseNotes,
      handleNavigate,
      handleResetData
    }}>
      {children}
    </UIContext.Provider>
  );
};
