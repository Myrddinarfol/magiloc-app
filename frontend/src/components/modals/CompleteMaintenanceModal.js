import React from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const CompleteMaintenanceModal = ({ equipment, onClose, onSuccess }) => {
  const { showToast } = useUI();

  const handleComplete = async () => {
    try {
      console.log('🔧 Validation maintenance pour:', equipment?.designation);

      // Remettre le matériel sur parc
      await equipmentService.update(equipment.id, {
        statut: 'SUR PARC'
      });

      console.log('✅ Maintenance validée');
      onSuccess();
      showToast('Maintenance validée ! Le matériel est de retour sur parc.', 'success');
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors de la validation: ${error.message}`, 'error');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal">
        <div className="modal-header">
          <h2>✅ Valider la Maintenance</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Êtes-vous sûr de vouloir valider la maintenance pour <strong>{equipment?.designation} {equipment?.cmu}</strong> ?
          </p>

          <div className="maintenance-summary-box" style={{
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            border: '2px solid #0ea5e9',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h4 style={{ marginTop: 0, color: '#0369a1' }}>📋 Récapitulatif</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <strong>Motif :</strong> {equipment?.motifMaintenance || 'N/A'}
              </div>
              <div>
                <strong>Notes retour :</strong> {equipment?.noteRetour || 'Aucune'}
              </div>
              <div>
                <strong>Date entrée :</strong> {equipment?.debutMaintenance || 'N/A'}
              </div>
            </div>
          </div>

          <p className="modal-info" style={{ marginTop: '20px' }}>
            <small>✅ Le matériel passera en statut "SUR PARC" et l'historique de maintenance sera enregistré.</small>
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleComplete} className="btn btn-success">
            ✅ Valider la Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteMaintenanceModal;
