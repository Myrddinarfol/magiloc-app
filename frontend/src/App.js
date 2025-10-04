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
import AnalyticsPage from './pages/AnalyticsPage';
import MaintenanceDashboardPage from './pages/MaintenanceDashboardPage';
import MaintenanceListPage from './pages/MaintenanceListPage';
import MaintenancePlanningPage from './pages/MaintenancePlanningPage';
import LocationListPage from './pages/LocationListPage';
import LocationPlanningPage from './pages/LocationPlanningPage';

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
    handleResetData,
    handleGoBack,
    handleOpenEquipmentDetail,
    toasts,
    showToast
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
    showToast(`${newData.length} équipements importés avec succès !`, 'success');

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
          onClose={handleGoBack}
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
      case 'analytics':
        return <AnalyticsPage />;
      case 'maintenance-dashboard':
        return <MaintenanceDashboardPage />;
      case 'maintenance-list':
        return <MaintenanceListPage />;
      case 'maintenance-planning':
        return <MaintenancePlanningPage />;
      case 'location-list':
        return <LocationListPage />;
      case 'location-planning':
        return <LocationPlanningPage />;
      default:
        return (
          <EquipmentListView
            equipmentData={equipmentData}
            currentPage={currentPage}
            setSelectedEquipment={setSelectedEquipment}
            handleOpenEquipmentDetail={handleOpenEquipmentDetail}
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
            <CSVImporter onDataImported={handleDataImported} showToast={showToast} />
          </div>
        )}

        {renderMainContent()}
      </div>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
              {toast.type === 'warning' && '⚠'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
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
