import React, { useState } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const StartLocationModal = ({ equipment, onClose, onSuccess }) => {
  const { showToast } = useUI();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);

  const handleSubmit = async () => {
    if (!startDate) {
      showToast('Veuillez saisir la date de début de location', 'warning');
      return;
    }

    try {
      console.log('🚀 Démarrage de location pour:', equipment?.designation);

      await equipmentService.update(equipment.id, {
        statut: 'En Location',
        debutLocation: startDate
      });

      console.log('✅ Location démarrée');
      onSuccess();
      setStartDate('');
      showToast('Location démarrée avec succès !', 'success');
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors du démarrage de la location: ${error.message}`, 'error');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal">
        <div className="modal-header">
          <h2>🚀 Démarrer la Location</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Démarrage de la location pour <strong>{equipment?.designation} {equipment?.cmu}</strong>
          </p>

          <div className="form-group">
            <label htmlFor="start-date-input">Date de début de location * :</label>
            <input
              id="start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>

          <p className="modal-info">
            <small>Cette action passera le matériel en statut "En Location"</small>
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn btn-success">
            ✅ Démarrer la Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartLocationModal;
