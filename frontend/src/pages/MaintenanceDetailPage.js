import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUI } from '../hooks/useUI';
import { useEquipment } from '../hooks/useEquipment';
import { useHistory } from '../hooks/useHistory';
import { cacheService } from '../services/cacheService';
import { historyService } from '../services/historyService';
import MaintenanceManagementPanel from '../components/maintenance/MaintenanceManagementPanel';
import ValidateMaintenanceModal from '../components/modals/ValidateMaintenanceModal';
import LocationHistoryModal from '../components/modals/LocationHistoryModal';
import MaintenanceHistoryModal from '../components/modals/MaintenanceHistoryModal';
import './MaintenanceDetailPage.css';

// Helper pour convertir une date française DD/MM/YYYY en Date object
const parseFrenchDate = (dateStr) => {
  if (!dateStr) return null;

  // Si c'est au format français DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00Z`);
  }

  // Sinon, essayer de parser comme ISO ou autre format
  return new Date(dateStr);
};

// Helper pour convertir l'équipement du format snake_case (DB) en camelCase (Frontend)
const normalizeEquipment = (equipment) => {
  if (!equipment) return equipment;

  const { formatDateToFrench } = {
    formatDateToFrench: (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

      const date = new Date(dateStr);
      if (isNaN(date)) return dateStr;

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }
  };

  return {
    id: equipment.id,
    designation: equipment.designation,
    cmu: equipment.cmu,
    modele: equipment.modele,
    marque: equipment.marque,
    longueur: equipment.longueur,
    infosComplementaires: equipment.infos_complementaires,
    numeroSerie: equipment.numero_serie,
    prixHT: equipment.prix_ht_jour,
    etat: equipment.etat,
    certificat: equipment.certificat,
    dernierVGP: formatDateToFrench(equipment.dernier_vgp),
    prochainVGP: formatDateToFrench(equipment.prochain_vgp),
    statut: equipment.statut,
    client: equipment.client,
    debutLocation: formatDateToFrench(equipment.debut_location),
    finLocationTheorique: formatDateToFrench(equipment.fin_location_theorique),
    rentreeLe: formatDateToFrench(equipment.rentre_le),
    numeroOffre: equipment.numero_offre,
    notesLocation: equipment.notes_location,
    motifMaintenance: equipment.motif_maintenance,
    noteRetour: equipment.note_retour
  };
};

// Helper pour obtenir les détails du VGP
const getVGPDetails = (date) => {
  if (!date) {
    return {
      color: 'gray',
      icon: '❓',
      label: 'Non renseigné',
      subLabel: 'Veuillez renseigner la date'
    };
  }

  const today = new Date();
  const vgpDate = parseFrenchDate(date);

  // Vérifier si la date est valide
  if (isNaN(vgpDate.getTime())) {
    return {
      color: 'gray',
      icon: '❌',
      label: 'Date invalide',
      subLabel: 'Format de date non reconnu'
    };
  }

  const daysUntil = Math.ceil((vgpDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return {
      color: 'red',
      icon: '⚠️',
      label: 'DÉPASSÉ',
      subLabel: `Depuis ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''}`
    };
  }

  if (daysUntil < 30) {
    return {
      color: 'orange',
      icon: '⏰',
      label: 'BIENTÔT',
      subLabel: `Plus que ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`
    };
  }

  return {
    color: 'green',
    icon: '✅',
    label: 'VALIDE',
    subLabel: `Valide pour ${daysUntil} jours`
  };
};

const MaintenanceDetailPage = ({ equipmentData = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, maintenanceData: contextMaintenanceData, setMaintenanceData: setContextMaintenanceData } = useUI();
  const { setEquipmentData: setContextEquipmentData } = useEquipment();

  const [equipment, setEquipment] = useState(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const maintenancePanelRef = useRef(null);

  // États pour les historiques
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  // Trouver l'équipement
  useEffect(() => {
    if (id && equipmentData.length > 0) {
      const found = equipmentData.find(eq => eq.id === parseInt(id));
      setEquipment(found || null);
      setLoading(false);

      // Initialize maintenance data with existing motif from equipment
      if (found && found.motifMaintenance) {
        setMaintenanceData(prev => ({
          ...prev,
          motif_maintenance: found.motifMaintenance
        }));
      }
    }
  }, [id, equipmentData]);

  // Auto-populate maintenance data from UIContext (when returning from location or putting in maintenance)
  // This takes priority over equipment's existing motif
  useEffect(() => {
    if (contextMaintenanceData && (contextMaintenanceData.motif || contextMaintenanceData.noteRetour)) {
      setMaintenanceData(prev => ({
        ...prev,
        motif_maintenance: contextMaintenanceData.motif || prev.motif_maintenance || '',
        note_retour: contextMaintenanceData.noteRetour || prev.note_retour || ''
      }));
      // Clear the context data after using it (prevent cross-equipment data leakage)
      setContextMaintenanceData({ motif: '', noteRetour: '' });
    }
  }, [contextMaintenanceData, setContextMaintenanceData]);

  // Ouvrir le modal avec les données du formulaire
  const handleOpenValidationModal = () => {
    if (maintenancePanelRef.current && maintenancePanelRef.current.getMaintenanceData) {
      const formData = maintenancePanelRef.current.getMaintenanceData();
      setMaintenanceData(formData);
    }
    setShowValidateModal(true);
  };

  const handleConfirmMaintenance = async (data) => {
    try {
      if (!equipment) return;

      console.log('📤 Envoi données maintenance:', data);

      // Mapper les données du formulaire aux clés attendues par le backend
      const maintenancePayload = {
        motif: data.motif_maintenance || '',
        notes: data.notes_maintenance || '',
        pieces: data.pieces_utilisees || [],
        tempsHeures: data.main_oeuvre_heures || 0,
        vgpEffectuee: data.vgp_effectuee || false,
        technicien: data.technicien || ''
      };

      console.log('📦 Payload envoyé:', maintenancePayload);

      const response = await fetch(`http://localhost:5000/api/equipment/${equipment.id}/maintenance/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenancePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Réponse erreur:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Maintenance validée:', result);
      console.log('🔄 Équipement retourné par backend:', result.equipment);

      // Mettre à jour le contexte avec l'équipement mis à jour (statut = Sur Parc)
      if (result.equipment) {
        // Normaliser l'équipement pour qu'il soit compatible avec le format frontend (camelCase)
        const normalizedEquipment = normalizeEquipment(result.equipment);
        console.log('✅ Équipement normalisé:', normalizedEquipment);

        const updatedEquipmentList = equipmentData.map(eq =>
          eq.id === normalizedEquipment.id ? normalizedEquipment : eq
        );

        // Mettre à jour le contexte
        setContextEquipmentData(updatedEquipmentList);
        console.log('✅ Contexte d\'équipement mis à jour');

        // Mettre à jour le cache aussi
        cacheService.set(updatedEquipmentList);
        console.log('✅ Cache d\'équipement mis à jour');
      }

      showToast('✅ Maintenance validée avec succès', 'success');
      setShowValidateModal(false);

      setTimeout(() => navigate('/maintenance'), 1000);
    } catch (err) {
      console.error('❌ Erreur sauvegarde maintenance:', err);
      showToast(`❌ Erreur: ${err.message}`, 'error');
    }
  };

  // Handlers pour charger les historiques
  const handleLoadLocationHistory = async () => {
    try {
      if (!equipment) return;
      console.log('📜 Chargement historique locations...');
      const data = await historyService.getLocationHistory(equipment.id);
      setLocationHistory(data);
      setShowLocationHistory(true);
    } catch (err) {
      console.error('❌ Erreur chargement historique locations:', err);
      showToast('Erreur lors du chargement de l\'historique des locations', 'error');
    }
  };

  const handleLoadMaintenanceHistory = async () => {
    try {
      if (!equipment) return;
      console.log('🔧 Chargement historique maintenance...');
      const data = await historyService.getMaintenanceHistory(equipment.id);
      setMaintenanceHistory(data);
      setShowMaintenanceHistory(true);
    } catch (err) {
      console.error('❌ Erreur chargement historique maintenance:', err);
      showToast('Erreur lors du chargement de l\'historique de maintenance', 'error');
    }
  };

  if (loading) {
    return (
      <div className="maintenance-page-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="maintenance-page-error">
        <div className="error-container">
          <h2>❌ Équipement non trouvé</h2>
          <p>L'équipement n° {id} n'existe pas ou n'est pas disponible.</p>
          <button onClick={() => navigate('/maintenance')} className="btn btn-primary">
            ← Retour à la maintenance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-page">
      {/* HEADER - FULL WIDTH */}
      <div className="maintenance-header">
        <div className="maintenance-header-content">
          <div className="maintenance-header-icon">🔧</div>
          <div className="maintenance-header-text">
            <h1>Maintenance de l'appareil :</h1>
            <p>Gestion complète de la maintenance - {equipment.designation}</p>
          </div>
        </div>
      </div>

      {/* BODY - 25/75 LAYOUT */}
      <div className="maintenance-body">
        {/* Left Sidebar - Equipment Info (25%) */}
        <div className="maintenance-sidebar">
          {/* Back Button */}
          <div className="sidebar-header">
            <button
              onClick={() => navigate('/maintenance')}
              className="sidebar-back-btn"
              title="Retour"
            >
              <span className="back-arrow">←</span>
              <span>Retour</span>
            </button>
          </div>

          {/* Equipment Title */}
          <div className="sidebar-title-section">
            <h2 className="sidebar-equipment-name">{equipment.designation}</h2>
            <p className="sidebar-equipment-cmu">{equipment.cmu}</p>
          </div>

        {/* Equipment Specs */}
        <div className="sidebar-specs-section">
          <div className="specs-grid">
            <div className="spec-card">
              <div className="spec-icon">🏷️</div>
              <div className="spec-content">
                <span className="spec-label">N° Série</span>
                <span className="spec-value">{equipment.numeroSerie}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">🏭</div>
              <div className="spec-content">
                <span className="spec-label">Marque</span>
                <span className="spec-value">{equipment.marque || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">📦</div>
              <div className="spec-content">
                <span className="spec-label">Modèle</span>
                <span className="spec-value">{equipment.modele || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">📏</div>
              <div className="spec-content">
                <span className="spec-label">Longueur</span>
                <span className="spec-value">{equipment.longueur || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">✨</div>
              <div className="spec-content">
                <span className="spec-label">État</span>
                <span className="spec-value">{equipment.etat || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">💰</div>
              <div className="spec-content">
                <span className="spec-label">Prix/j</span>
                <span className="spec-value">{equipment.prixHT ? `${equipment.prixHT}€` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VGP Section - Exact copy from fiches matériels */}
        <div className="sidebar-vgp-section">
          <div className="vgp-section-header-sidebar">
            <h4 className="vgp-section-title">Contrôles VGP</h4>
          </div>

          {/* Certificat Info */}
          <div className="vgp-detail-grid">
            <div className="vgp-info-item">
              <span className="vgp-info-label">Certificat:</span>
              {equipment.certificat ? (
                <a
                  href={`https://www.google.com/search?q=${equipment.certificat}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="certificat-link"
                >
                  {equipment.certificat} 🔗
                </a>
              ) : (
                <span className="vgp-info-value">Non renseigné</span>
              )}
            </div>
          </div>

          {/* VGP Status Card */}
          <div className={`vgp-status-card vgp-status-${getVGPDetails(equipment.prochainVGP).color}`}>
            <div className="vgp-status-icon">{getVGPDetails(equipment.prochainVGP).icon}</div>
            <div className="vgp-status-content">
              <div className="vgp-status-label">{getVGPDetails(equipment.prochainVGP).label}</div>
              <div className="vgp-status-date">{equipment.prochainVGP || 'Non renseigné'}</div>
              <div className="vgp-status-sublabel">{getVGPDetails(equipment.prochainVGP).subLabel}</div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="sidebar-history-section">
          <div className="history-section-header">
            <h4 className="history-section-title">📚 Historique</h4>
          </div>
          <div className="history-buttons-container">
            <button
              className="btn-history-item"
              onClick={handleLoadLocationHistory}
              title="Voir l'historique des locations"
            >
              📜 Locations
            </button>
            <button
              className="btn-history-item"
              onClick={handleLoadMaintenanceHistory}
              title="Voir l'historique de maintenance"
            >
              🔧 Maintenance
            </button>
          </div>
        </div>

        {/* Validate Button */}
        <button
          className="btn-validate-maintenance-sidebar"
          onClick={handleOpenValidationModal}
        >
          ✅ VALIDER MAINTENANCE
        </button>

      </div>

      {/* Right Content Area - Maintenance Management (75%) */}
      <div className="maintenance-content">
        <div className="content-panel">
          <MaintenanceManagementPanel
            ref={maintenancePanelRef}
            equipment={equipment}
            onValidateMaintenance={(data) => {
              setMaintenanceData(data);
              setShowValidateModal(true);
            }}
            maintenanceData={maintenanceData}
          />
        </div>
      </div>
      </div>

      {/* Validation Modal */}
      {showValidateModal && (
        <ValidateMaintenanceModal
          equipment={equipment}
          maintenance={maintenanceData}
          onConfirm={handleConfirmMaintenance}
          onCancel={() => setShowValidateModal(false)}
        />
      )}

      {/* Location History Modal */}
      {showLocationHistory && (
        <LocationHistoryModal
          history={locationHistory}
          onClose={() => setShowLocationHistory(false)}
        />
      )}

      {/* Maintenance History Modal */}
      {showMaintenanceHistory && (
        <MaintenanceHistoryModal
          history={maintenanceHistory}
          onClose={() => setShowMaintenanceHistory(false)}
        />
      )}
    </div>
  );
};

export default MaintenanceDetailPage;
