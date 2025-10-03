import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { UIProvider } from './context/UIContext';
import { useAuth } from './hooks/useAuth';
import { useEquipment } from './hooks/useEquipment';
import { useUI } from './hooks/useUI';
import { useHistory } from './hooks/useHistory';
import { getStatusClass } from './utils/statusHelpers';
import { STORAGE_KEY } from './config/constants';

// Pages
import LoginPage from './pages/LoginPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';
import DashboardPage from './pages/DashboardPage';
import PlanningPage from './pages/PlanningPage';

// Components
import Sidebar from './components/layout/Sidebar';
import LoadingState from './components/common/LoadingState';
import EquipmentListView from './components/EquipmentListView';
import EquipmentDetailView from './components/equipment/EquipmentDetailView';
import CSVImporter from './components/CSVImporter';
import ReleaseNotesHistory from './components/ReleaseNotesHistory';

// Modals
import CertificatModal from './components/modals/CertificatModal';
import ReservationModal from './components/modals/ReservationModal';
import StartLocationModal from './components/modals/StartLocationModal';
import ReturnModal from './components/modals/ReturnModal';
import EditTechInfoModal from './components/modals/EditTechInfoModal';
import AddEquipmentModal from './components/modals/AddEquipmentModal';
import LocationHistoryModal from './components/modals/LocationHistoryModal';
import MaintenanceHistoryModal from './components/modals/MaintenanceHistoryModal';

import './App.css';

// Composant principal de l'application (après authentification)
const MainApp = () => {
  const { equipmentData, setEquipmentData, isLoading, loadingMessage, retryCount, loadEquipments } = useEquipment();
  const {
    currentPage,
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
    handleResetData
  } = useUI();

  const { locationHistory, maintenanceHistory, loadLocationHistory, loadMaintenanceHistory } = useHistory();

  // Gestionnaires de succès pour les modals
  const handleModalSuccess = async () => {
    await loadEquipments();
    setShowCertificatModal(false);
    setShowReservationModal(false);
    setShowStartLocationModal(false);
    setShowReturnModal(false);
    setShowEditTechInfoModal(false);
    setShowAddEquipmentModal(false);
    setSelectedEquipment(null);
  };

  const handleDataImported = async (newData) => {
    setEquipmentData(newData);
    setShowImporter(false);
    localStorage.removeItem(STORAGE_KEY);
    alert(`${newData.length} équipements importés avec succès !`);

    try {
      const freshData = await loadEquipments();
      console.log('✅ Données rechargées depuis PostgreSQL');
    } catch (err) {
      console.error('⚠️ Erreur rechargement:', err);
    }
  };

  // Rendu du contenu principal
  const renderMainContent = () => {
    if (isLoading) {
      return <LoadingState loadingMessage={loadingMessage} retryCount={retryCount} />;
    }

    if (selectedEquipment) {
      return (
        <EquipmentDetailView
          equipment={selectedEquipment}
          currentPage={currentPage}
          onClose={() => setSelectedEquipment(null)}
          onEditCertificat={() => setShowCertificatModal(true)}
          onEditTechInfo={() => setShowEditTechInfoModal(true)}
          onLoadLocationHistory={() => loadLocationHistory(selectedEquipment.id, () => setShowLocationHistory(true))}
          onLoadMaintenanceHistory={() => loadMaintenanceHistory(selectedEquipment.id, () => setShowMaintenanceHistory(true))}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'planning':
        return <PlanningPage />;
      default:
        return (
          <EquipmentListView
            equipmentData={equipmentData}
            currentPage={currentPage}
            setSelectedEquipment={setSelectedEquipment}
            getStatusClass={getStatusClass}
            setShowImporter={setShowImporter}
            handleResetData={() => handleResetData(setEquipmentData)}
            setShowAddEquipmentModal={setShowAddEquipmentModal}
          />
        );
    }
  };

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

      {/* Modals */}
      {showNotesHistory && (
        <ReleaseNotesHistory onClose={() => setShowNotesHistory(false)} />
      )}

      {showCertificatModal && selectedEquipment && (
        <CertificatModal
          equipment={selectedEquipment}
          onClose={() => setShowCertificatModal(false)}
          onSave={handleModalSuccess}
        />
      )}

      {showReservationModal && selectedEquipment && (
        <ReservationModal
          equipment={selectedEquipment}
          onClose={() => setShowReservationModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showStartLocationModal && selectedEquipment && (
        <StartLocationModal
          equipment={selectedEquipment}
          onClose={() => setShowStartLocationModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showReturnModal && selectedEquipment && (
        <ReturnModal
          equipment={selectedEquipment}
          onClose={() => setShowReturnModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showEditTechInfoModal && selectedEquipment && (
        <EditTechInfoModal
          equipment={selectedEquipment}
          onClose={() => setShowEditTechInfoModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showAddEquipmentModal && (
        <AddEquipmentModal
          onClose={() => setShowAddEquipmentModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showLocationHistory && (
        <LocationHistoryModal
          history={locationHistory}
          onClose={() => setShowLocationHistory(false)}
        />
      )}

      {showMaintenanceHistory && (
        <MaintenanceHistoryModal
          history={maintenanceHistory}
          onClose={() => setShowMaintenanceHistory(false)}
        />
      )}
    </div>
  );
};

// Point d'entrée de l'application avec les Providers
function App() {
  return (
    <AuthProvider>
      <EquipmentProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </EquipmentProvider>
    </AuthProvider>
  );
}

// Composant de routage principal
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const { showReleaseNotes } = useUI();

  if (showReleaseNotes) {
    return (
      <>
        <ReleaseNotesPage />
        <Analytics />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Analytics />
      </>
    );
  }

  return (
    <>
      <MainApp />
      <Analytics />
    </>
  );
};

export default App;
