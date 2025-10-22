import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { UIProvider } from './context/UIContext';
import { ClientProvider } from './context/ClientContext';
import { SparePartsProvider } from './context/SparePartsContext';
import { useAuth } from './hooks/useAuth';
import { useEquipment } from './hooks/useEquipment';
import { useUI } from './hooks/useUI';
import { useHistory } from './hooks/useHistory';
import { getStatusClass } from './utils/statusHelpers';
import { STORAGE_KEY } from './config/constants';
import { initTooltips } from './utils/tooltipManager';

// Pages
import LoginPage from './pages/LoginPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MaintenanceDashboardPage from './pages/MaintenanceDashboardPage';
import MaintenanceListPage from './pages/MaintenanceListPage';
import MaintenancePlanningPage from './pages/MaintenancePlanningPage';
import MaintenanceDetailPage from './pages/MaintenanceDetailPage';
import VGPManagementPage from './pages/VGPManagementPage';
import LocationListPage from './pages/LocationListPage';
import LocationPlanningPage from './pages/LocationPlanningPage';
import ClientManagementPage from './pages/ClientManagementPage';
import SparePartsManagementPage from './pages/SparePartsManagementPage';
import TarifsPage from './pages/TarifsPage';

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

  // Initialiser le système de tooltips
  React.useEffect(() => {
    const observer = initTooltips();
    return () => observer.disconnect();
  }, []);

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
    maintenanceData,
    setMaintenanceData,
    handleResetData,
    handleGoBack,
    handleOpenEquipmentDetail,
    toasts,
    showToast
  } = useUI();

  const { locationHistory, maintenanceHistory, loadLocationHistory, loadMaintenanceHistory } = useHistory();

  // State local pour le modal de confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  // State local pour suivre si on doit recharger la fiche après édition
  const [shouldRefreshDetail, setShouldRefreshDetail] = React.useState(false);

  // Mettre à jour la fiche détail quand les données changent
  React.useEffect(() => {
    if (shouldRefreshDetail && selectedEquipment && equipmentData.length > 0) {
      const updatedEquipment = equipmentData.find(eq => eq.id === selectedEquipment.id);
      if (updatedEquipment) {
        console.log('🔄 Mise à jour automatique de la fiche détail:', updatedEquipment);
        setSelectedEquipment(updatedEquipment);
        setShouldRefreshDetail(false);
      }
    }
  }, [equipmentData, selectedEquipment, shouldRefreshDetail]);

  // Gestionnaires de succès pour les modals - avec redirection intelligente
  const handleModalSuccess = async (targetPage) => {
    console.log('🔄 handleModalSuccess - targetPage fournie:', targetPage);

    // Vider le cache pour forcer le rechargement depuis l'API
    const { cacheService } = await import('./services/cacheService');
    cacheService.clear();

    // Cas spécial : édition technique depuis PARC LOC
    // On garde la fiche ouverte pour voir les modifications
    if (targetPage === 'stay-on-detail') {
      console.log('🔄 Rester sur la fiche détail après édition');
      // Marquer qu'on doit rafraîchir la fiche
      setShouldRefreshDetail(true);
      // Recharger les données depuis l'API
      await loadEquipments(1, false, true);
      return; // Ne pas fermer la fiche
    }

    // Forcer le rechargement depuis l'API pour les autres cas
    await loadEquipments(1, false, true);

    // Fermer tous les modals
    setShowCertificatModal(false);
    setShowReservationModal(false);
    setShowStartLocationModal(false);
    setShowEditTechInfoModal(false);
    setShowAddEquipmentModal(false);
    setShowMaintenanceModal(false);
    setShowCompleteMaintenance(false);

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
  const handleCancelReservation = async (equipment) => {
    // Utiliser l'équipement passé en paramètre ou celui sélectionné
    const equipmentToCancel = equipment || selectedEquipment;
    if (!equipmentToCancel) return;

    try {
      const { equipmentService } = await import('./services/equipmentService');
      await equipmentService.update(equipmentToCancel.id, {
        statut: 'Sur Parc',
        client: null,
        debutLocation: null,
        finLocationTheorique: null,
        numeroOffre: null,
        notesLocation: null
      });
      showToast('Réservation annulée ! Le matériel est de retour sur parc.', 'success');
      await loadEquipments();
      // Ne pas réinitialiser selectedEquipment si on est dans la fiche
      // Pas de changement de page - on reste sur l'onglet actuel
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      showToast(`Erreur lors de l'annulation: ${error.message}`, 'error');
    }
  };

  // Gestionnaire de démarrage de location
  const handleStartLocation = async (equipment, startDate) => {
    if (!equipment || !startDate) return;

    try {
      const { equipmentService } = await import('./services/equipmentService');
      await equipmentService.update(equipment.id, {
        statut: 'En Location',
        debutLocation: startDate
      });
      showToast('Location démarrée avec succès !', 'success');
      await loadEquipments();
    } catch (error) {
      console.error('❌ Erreur démarrage location:', error);
      showToast(`Erreur lors du démarrage de la location: ${error.message}`, 'error');
    }
  };

  // Gestionnaire de retour de location
  const handleReturnLocation = async (equipment, returnDate, returnNotes) => {
    if (!equipment || !returnDate) return;

    try {
      const { equipmentService } = await import('./services/equipmentService');

      // Préparer les données de retour
      const returnData = {
        rentreeLe: returnDate,
        noteRetour: returnNotes || '',
        minimumFacturationApply: equipment.minimumFacturationApply || false
      };

      // Appeler le service de retour
      await equipmentService.returnEquipment(equipment.id, returnData);

      // Stocker les données dans UIContext pour la page de maintenance
      setMaintenanceData({
        motif: 'Retour Location, à vérifier',
        noteRetour: returnNotes || ''
      });

      showToast('Retour effectué avec succès ! Le matériel est en maintenance.', 'success');
      await loadEquipments();
    } catch (error) {
      console.error('❌ Erreur retour location:', error);
      showToast(`Erreur lors du retour: ${error.message}`, 'error');
    }
  };

  // Gestionnaire de création de réservation
  const handleCreateReservation = async (equipment, formData) => {
    if (!equipment || !formData.client) return;

    try {
      const { equipmentService } = await import('./services/equipmentService');

      // Préparer les données de réservation
      const reservationData = {
        statut: 'En Réservation',
        client: formData.client,
        debutLocation: formData.debutLocation || null,
        finLocationTheorique: formData.finLocationTheorique || null,
        departEnlevement: formData.departEnlevement || null,
        numeroOffre: formData.numeroOffre || null,
        notesLocation: formData.notesLocation || null,
        estLongDuree: formData.estLongDuree || false,
        minimumFacturationApply: formData.minimumFacturationApply || false
      };

      // Mettre à jour le matériel
      await equipmentService.update(equipment.id, reservationData);

      showToast('Réservation créée avec succès !', 'success');
      await loadEquipments();
    } catch (error) {
      console.error('❌ Erreur création réservation:', error);
      showToast(`Erreur lors de la création de la réservation: ${error.message}`, 'error');
    }
  };

  // Gestionnaire d'échange de matériel
  const handleExchange = async (currentEquipment, replacementEquipment) => {
    if (!currentEquipment || !replacementEquipment) return;

    try {
      const { equipmentService } = await import('./services/equipmentService');

      // Extraire le motif d'échange s'il est présent
      const exchangeReason = replacementEquipment.exchangeReason || '';

      // Déterminer les actions selon le statut actuel
      const isReservation = currentEquipment.statut === 'En Réservation';
      const isLocation = currentEquipment.statut === 'En Location';

      if (isReservation) {
        // ✅ CAS RÉSERVATION: Mettre le matériel actuel en Sur Parc
        //    et copier client/dates au matériel de remplacement
        await equipmentService.update(currentEquipment.id, {
          statut: 'Sur Parc',
          client: null,
          debutLocation: null,
          finLocationTheorique: null,
          departEnlevement: null,
          numeroOffre: null,
          notesLocation: null
        });

        // Mettre le matériel de remplacement en réservation avec les mêmes données
        await equipmentService.update(replacementEquipment.id, {
          statut: 'En Réservation',
          client: currentEquipment.client,
          debutLocation: currentEquipment.debutLocation,
          finLocationTheorique: currentEquipment.finLocationTheorique,
          departEnlevement: currentEquipment.departEnlevement,
          numeroOffre: currentEquipment.numeroOffre,
          notesLocation: exchangeReason ? `[ÉCHANGE] ${currentEquipment.notesLocation ? currentEquipment.notesLocation + ' | ' : ''}Motif: ${exchangeReason}` : currentEquipment.notesLocation
        });

        showToast(`✅ Échange effectué ! ${currentEquipment.designation} → Sur Parc | ${replacementEquipment.designation} → En Réservation`, 'success');
      } else if (isLocation) {
        // ✅ CAS LOCATION: Mettre le matériel actuel en Maintenance
        //    et copier client/dates au matériel de remplacement
        await equipmentService.update(currentEquipment.id, {
          statut: 'En Maintenance',
          motif: exchangeReason ? `Échange location - ${exchangeReason}` : 'Échange location',
          noteRetour: `Matériel échangé - Remplacement: ${replacementEquipment.numeroSerie}`
        });

        // Mettre le matériel de remplacement en location avec les mêmes données
        await equipmentService.update(replacementEquipment.id, {
          statut: 'En Location',
          client: currentEquipment.client,
          debutLocation: currentEquipment.debutLocation,
          finLocationTheorique: currentEquipment.finLocationTheorique,
          departEnlevement: currentEquipment.departEnlevement
        });

        showToast(`✅ Échange effectué ! ${currentEquipment.designation} → En Maintenance | ${replacementEquipment.designation} → En Location`, 'success');
      }

      // Recharger les équipements après l'échange
      await loadEquipments();
    } catch (error) {
      console.error('❌ Erreur échange:', error);
      showToast(`Erreur lors de l'échange: ${error.message}`, 'error');
    }
  };

  // Listener pour l'événement d'échange (depuis EquipmentListView)
  React.useEffect(() => {
    const handleExchangeEvent = (e) => {
      const { currentEquipment, replacementEquipment } = e.detail;
      handleExchange(currentEquipment, replacementEquipment);
    };

    window.addEventListener('equipment-exchange', handleExchangeEvent);
    return () => window.removeEventListener('equipment-exchange', handleExchangeEvent);
  }, []);

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
          onEditLocationInfo={handleModalSuccess}
          onLoadLocationHistory={() => loadLocationHistory(selectedEquipment.id, () => setShowLocationHistory(true))}
          onLoadMaintenanceHistory={() => loadMaintenanceHistory(selectedEquipment.id, () => setShowMaintenanceHistory(true))}
          onDelete={handleDelete}
          onCancelReservation={handleCancelReservation}
          onCreateReservation={handleCreateReservation}
          onStartLocation={handleStartLocation}
          onReturnLocation={handleReturnLocation}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'clients':
        return <ClientManagementPage />;
      case 'spare-parts':
        return <SparePartsManagementPage />;
      case 'tarifs':
        return <TarifsPage equipmentData={equipmentData} onRefresh={loadEquipments} />;
      case 'maintenance-dashboard':
        return <MaintenanceDashboardPage />;
      case 'maintenance-list':
        return <MaintenanceListPage />;
      case 'maintenance-planning':
        return <MaintenancePlanningPage />;
      case 'vgp-management':
        return <VGPManagementPage />;
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
            onCancelReservation={handleCancelReservation}
            onStartLocation={handleStartLocation}
            onCreateReservation={handleCreateReservation}
            onReturnLocation={handleReturnLocation}
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
    <ThemeProvider>
      <AuthProvider>
        <EquipmentProvider>
          <UIProvider>
            <ClientProvider>
              <SparePartsProvider>
                <AppContent />
              </SparePartsProvider>
            </ClientProvider>
          </UIProvider>
        </EquipmentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Wrapper pour MaintenanceDetailPage avec accès au EquipmentContext
const MaintenanceDetailPageWrapper = () => {
  const { equipmentData } = useEquipment();
  return <MaintenanceDetailPage equipmentData={equipmentData} />;
};

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
    <Router>
      <Routes>
        <Route path="/maintenance/:id" element={<MaintenanceDetailPageWrapper />} />
        <Route path="*" element={<><MainApp shouldStartTour={shouldStartTour} /><Analytics /></>} />
      </Routes>
    </Router>
  );
};

export default App;
