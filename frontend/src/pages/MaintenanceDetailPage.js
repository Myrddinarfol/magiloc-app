import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUI } from '../hooks/useUI';
import MaintenanceManagementPanel from '../components/maintenance/MaintenanceManagementPanel';
import ValidateMaintenanceModal from '../components/modals/ValidateMaintenanceModal';
import './MaintenanceDetailPage.css';

// Helper pour déterminer la couleur du statut VGP
const getVGPStatusColor = (date) => {
  if (!date) return 'gray';
  const today = new Date();
  const vgpDate = new Date(date);
  const daysUntil = Math.ceil((vgpDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return 'red';
  if (daysUntil < 30) return 'orange';
  return 'green';
};

const MaintenanceDetailPage = ({ equipmentData = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [equipment, setEquipment] = useState(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({});
  const [loading, setLoading] = useState(true);

  // Trouver l'équipement
  useEffect(() => {
    if (id && equipmentData.length > 0) {
      const found = equipmentData.find(eq => eq.id === parseInt(id));
      setEquipment(found || null);
      setLoading(false);
    }
  }, [id, equipmentData]);

  const handleConfirmMaintenance = async (data) => {
    try {
      if (!equipment) return;

      const maintenancePayload = {
        motif: data.motif || '',
        notes: data.notes || '',
        pieces: data.pieces || [],
        tempsHeures: data.tempsHeures || 0,
        vgpEffectuee: data.vgpEffectuee || false,
        technicien: data.technicien || ''
      };

      const response = await fetch(`http://localhost:5000/api/equipment/${equipment.id}/maintenance/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenancePayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Maintenance validée:', result);
      showToast('✅ Maintenance validée avec succès', 'success');
      setShowValidateModal(false);

      setTimeout(() => navigate('/maintenance'), 1000);
    } catch (err) {
      console.error('❌ Erreur sauvegarde maintenance:', err);
      showToast(`❌ Erreur: ${err.message}`, 'error');
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
      {/* Left Sidebar - Equipment Info (25%) */}
      <div className="maintenance-sidebar">
        {/* Header - Back Button */}
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

        {/* VGP Status Card */}
        <div className="sidebar-vgp-compact">
          <div className={`vgp-status-card-compact vgp-status-${getVGPStatusColor(equipment.prochainVGP)}`}>
            <div className="vgp-compact-icon">📅</div>
            <div className="vgp-compact-content">
              <div className="vgp-compact-label">Prochain VGP</div>
              <div className="vgp-compact-date">{equipment.prochainVGP || 'Non renseigné'}</div>
            </div>
          </div>
        </div>

        {/* Validate Button */}
        <button
          className="btn-validate-maintenance-sidebar"
          onClick={() => {
            setShowValidateModal(true);
          }}
        >
          ✅ VALIDER
        </button>

      </div>

      {/* Right Content Area - Maintenance Management (75%) */}
      <div className="maintenance-content">
        <div className="content-header">
          <h1>Gestion de Maintenance</h1>
          <p>Complétez tous les détails de la maintenance ci-dessous</p>
        </div>

        <div className="content-panel">
          <MaintenanceManagementPanel
            equipment={equipment}
            onValidateMaintenance={(data) => {
              setMaintenanceData(data);
              setShowValidateModal(true);
            }}
            maintenanceData={maintenanceData}
          />
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
    </div>
  );
};

export default MaintenanceDetailPage;
