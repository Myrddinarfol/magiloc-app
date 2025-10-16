import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUI } from '../hooks/useUI';
import MaintenanceManagementPanel from '../components/maintenance/MaintenanceManagementPanel';
import ValidateMaintenanceModal from '../components/modals/ValidateMaintenanceModal';
import './MaintenanceDetailPage.css';

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

      // Préparer les données de maintenance pour l'API
      const maintenancePayload = {
        motif: data.motif || '',
        notes: data.notes || '',
        pieces: data.pieces || [],
        tempsHeures: data.tempsHeures || 0,
        vgpEffectuee: data.vgpEffectuee || false,
        technicien: data.technicien || ''
      };

      // Appel API pour sauvegarder la maintenance
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

      // Rediriger vers la page maintenance après 1 seconde
      setTimeout(() => navigate('/maintenance'), 1000);
    } catch (err) {
      console.error('❌ Erreur sauvegarde maintenance:', err);
      showToast(`❌ Erreur: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="maintenance-detail-page-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="maintenance-detail-page-error">
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
    <div className="maintenance-detail-page">
      {/* Header */}
      <div className="maintenance-detail-page-header">
        <div className="maintenance-header-content">
          <button
            onClick={() => navigate('/maintenance')}
            className="maintenance-back-btn"
            title="Retour"
          >
            ← Retour
          </button>

          <div className="maintenance-header-title">
            <h1>{equipment.designation}</h1>
            <p className="maintenance-header-subtitle">Gestion de Maintenance</p>
          </div>

          <div className="maintenance-header-specs">
            <div className="spec-item">
              <span className="spec-label">CMU</span>
              <span className="spec-value">{equipment.cmu}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">N° Série</span>
              <span className="spec-value">{equipment.numeroSerie}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Marque</span>
              <span className="spec-value">{equipment.marque || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Modèle</span>
              <span className="spec-value">{equipment.modele || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">État</span>
              <span className="spec-value">{equipment.etat || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Longueur</span>
              <span className="spec-value">{equipment.longueur || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="maintenance-detail-page-content">
        <div className="maintenance-page-panel">
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
