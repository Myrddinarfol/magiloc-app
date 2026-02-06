import React, { useState, useEffect } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import MaintenanceManagementPanel from '../components/maintenance/MaintenanceManagementPanel';
import ValidateMaintenanceModal from '../components/modals/ValidateMaintenanceModal';
import './MaintenanceDetailModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MaintenanceDetailModal = ({ equipment, onClose }) => {
  const { showToast } = useUI();
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({});

  if (!equipment) return null;

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
      const response = await fetch(`${API_URL}/api/equipment/${equipment.id}/maintenance/validate`, {
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

      // Rediriger après 1 seconde
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error('❌ Erreur sauvegarde maintenance:', err);
      showToast(`❌ Erreur: ${err.message}`, 'error');
    }
  };

  return (
    <div className="maintenance-detail-modal-overlay">
      <div className="maintenance-detail-modal">
        {/* Header */}
        <div className="maintenance-detail-header">
          <div className="maintenance-detail-header-content">
            <h2>{equipment.designation}</h2>
            <div className="maintenance-detail-specs">
              <span>CMU: {equipment.cmu}</span>
              <span>N°Série: {equipment.numeroSerie}</span>
              <span>État: {equipment.etat || 'N/A'}</span>
            </div>
          </div>
          <button className="maintenance-detail-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="maintenance-detail-body">
          <MaintenanceManagementPanel
            equipment={equipment}
            onValidateMaintenance={(data) => {
              setMaintenanceData(data);
              setShowValidateModal(true);
            }}
            maintenanceData={maintenanceData}
          />
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
    </div>
  );
};

export default MaintenanceDetailModal;
