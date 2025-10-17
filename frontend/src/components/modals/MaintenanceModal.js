import React, { useState } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const MaintenanceModal = ({ equipment, onClose, onSuccess }) => {
  const { showToast, setMaintenanceData } = useUI();
  const [motif, setMotif] = useState('');

  const handleSubmit = async () => {
    if (!motif.trim()) {
      showToast('Veuillez saisir le motif de maintenance', 'warning');
      return;
    }

    try {
      console.log('🔧 Mise en maintenance pour:', equipment?.designation);

      await equipmentService.update(equipment.id, {
        statut: 'En Maintenance',
        motifMaintenance: motif.trim(),
        debutMaintenance: new Date().toISOString()
      });

      // Store motif in UIContext for auto-population in MaintenanceDetailPage
      setMaintenanceData({
        motif: motif.trim(),
        noteRetour: ''
      });

      console.log('✅ Matériel mis en maintenance');
      showToast('Matériel mis en maintenance avec succès !', 'success');
      setMotif('');
      onClose();
      onSuccess('maintenance-list'); // Naviguer vers maintenance list
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors de la mise en maintenance: ${error.message}`, 'error');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal">
        <div className="modal-header">
          <h2>🔧 Mettre en Maintenance</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Mise en maintenance de <strong>{equipment?.designation} {equipment?.cmu}</strong>
          </p>

          <div className="form-group">
            <label htmlFor="motif-maintenance">Motif de maintenance * :</label>
            <textarea
              id="motif-maintenance"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Révision annuelle, Réparation câble, VGP à effectuer..."
              className="form-input"
              rows="4"
              required
            />
          </div>

          <p className="modal-info">
            <small>⚠️ Le matériel passera en statut "En Maintenance"</small>
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            🔧 Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
