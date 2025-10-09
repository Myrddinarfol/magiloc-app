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
import GuidedTour from './components/common/GuidedTour';
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
import MaintenanceModal from './components/modals/MaintenanceModal';
import CompleteMaintenanceModal from './components/modals/CompleteMaintenanceModal';
import DeleteConfirmModal from './components/modals/DeleteConfirmModal';

import './App.css';

// Composant principal de l'application (après authentification)
const MainApp = ({ shouldStartTour }) => {
  const { equipmentData, setEquipmentData, isLoading, loadingMessage, retryCount, loadEquipments } = useEquipment();
  const [showTour, setShowTour] = React.useState(false);

  // Démarrer la visite guidée si demandé depuis le login
  React.useEffect(() => {
    if (shouldStartTour) {
      // Petit délai pour laisser l'app se charger complètement
      setTimeout(() => setShowTour(true), 500);
    }
  }, [shouldStartTour]);
  const {
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
    handleResetData,
    handleGoBack,
    handleOpenEquipmentDetail,
    toasts,
    showToast
  } = useUI();

  const { locationHistory, maintenanceHistory, loadLocationHistory, loadMaintenanceHistory } = useHistory();

  // State local pour le modal de confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Gestionnaires de succès pour les modals - avec redirection intelligente
  const handleModalSuccess = async (targetPage) => {
    console.log('🔄 handleModalSuccess - targetPage fournie:', targetPage);

    await loadEquipments();

    // Fermer tous les modals
    setShowCertificatModal(false);
    setShowReservationModal(false);
    setShowStartLocationModal(false);
    setShowReturnModal(false);
    setShowEditTechInfoModal(false);
    setShowAddEquipmentModal(false);
    setShowMaintenanceModal(false);
    setShowCompleteMaintenance(false);

    // Cas spécial : édition technique depuis PARC LOC
    // On garde la fiche ouverte pour voir les modifications
    if (targetPage === 'stay-on-detail') {
      console.log('🔄 Rester sur la fiche détail après édition');
      // Attendre que loadEquipments soit terminé, puis recharger l'équipement
      setTimeout(() => {
        if (selectedEquipment) {
          const updatedEquipment = equipmentData.find(eq => eq.id === selectedEquipment.id);
          if (updatedEquipment) {
            console.log('✅ Équipement mis à jour sur la fiche:', updatedEquipment);
            setSelectedEquipment(updatedEquipment);
          }
        }
      }, 100); // Petit délai pour s'assurer que equipmentData est à jour
      return; // Ne pas fermer la fiche
    }

    // Fermer la fiche détail (comportement par défaut)
    setSelectedEquipment(null);

    // Naviguer vers la page cible si fournie
    if (targetPage) {
      console.log('✈️ Navigation vers:', targetPage);
      setCurrentPage(targetPage);
      setPreviousPage(null);
    }
  };

  // Gestionnaire de suppression - Ouvrir le modal
  const handleDelete = () => {
    if (!selectedEquipment) return;
    setShowDeleteConfirm(true);
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!selectedEquipment) return;

    try {
      const { equipmentService } = await import('./services/equipmentService');
      await equipmentService.delete(selectedEquipment.id);
      showToast('Matériel supprimé avec succès !', 'success');
      await loadEquipments();
      setSelectedEquipment(null);
      setShowDeleteConfirm(false);
      handleGoBack();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showToast(`Erreur lors de la suppression: ${error.message}`, 'error');
      setShowDeleteConfirm(false);
    }
  };

  // Gestionnaire d'annulation de réservation
  const handleCancelReservation = async () => {
    if (!selectedEquipment) return;

    try {
      const { equipmentService } = await import('./services/equipmentService');
      await equipmentService.update(selectedEquipment.id, {
        statut: 'Sur Parc',
        client: null,
        debutLocation: null,
        finLocationTheorique: null,
        numeroOffre: null,
        notesLocation: null
      });
      showToast('Réservation annulée ! Le matériel est de retour sur parc.', 'success');
      await loadEquipments();
      setSelectedEquipment(null);
      setCurrentPage('en-offre');
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      showToast(`Erreur lors de l'annulation: ${error.message}`, 'error');
    }
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
          onDelete={handleDelete}
          onCancelReservation={handleCancelReservation}
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

      {showMaintenanceModal && selectedEquipment && (
        <MaintenanceModal
          equipment={selectedEquipment}
          onClose={() => setShowMaintenanceModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showCompleteMaintenance && selectedEquipment && (
        <CompleteMaintenanceModal
          equipment={selectedEquipment}
          onClose={() => setShowCompleteMaintenance(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showDeleteConfirm && selectedEquipment && (
        <DeleteConfirmModal
          equipment={selectedEquipment}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Guided Tour */}
      <GuidedTour isActive={showTour} onClose={() => setShowTour(false)} />
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
  const [shouldStartTour, setShouldStartTour] = React.useState(false);

  const handleLoginSuccess = (startTour) => {
    if (startTour) {
      setShouldStartTour(true);
    }
  };

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
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <Analytics />
      </>
    );
  }

  return (
    <>
      <MainApp shouldStartTour={shouldStartTour} />
      <Analytics />
    </>
  );
};

export default App;
