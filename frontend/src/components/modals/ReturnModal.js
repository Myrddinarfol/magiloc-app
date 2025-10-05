import React, { useState } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const ReturnModal = ({ equipment, onClose, onSuccess }) => {
  const { showToast } = useUI();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    rentreeLe: today,
    noteRetour: ''
  });

  const handleSubmit = async () => {
    if (!form.rentreeLe) {
      showToast('Veuillez saisir la date de retour', 'warning');
      return;
    }

    try {
      console.log('🔄 Retour pour:', equipment?.designation);

      await equipmentService.returnEquipment(equipment.id, form);

      console.log('✅ Retour effectué');
      showToast('Retour effectué avec succès ! Le matériel est maintenant en maintenance.', 'success');
      setForm({ rentreeLe: '', noteRetour: '' });
      onClose();
      onSuccess('location-list'); // Rester sur locations en cours
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors du retour: ${error.message}`, 'error');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal">
        <div className="modal-header">
          <h2>✅ Effectuer le Retour</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Retour de location pour <strong>{equipment?.designation} {equipment?.cmu}</strong>
          </p>

          <div className="form-group">
            <label htmlFor="rentre-le-input">Date de retour * :</label>
            <input
              id="rentre-le-input"
              type="date"
              value={form.rentreeLe}
              onChange={(e) => setForm({...form, rentreeLe: e.target.value})}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="note-retour-input">Note de retour :</label>
            <textarea
              id="note-retour-input"
              value={form.noteRetour}
              onChange={(e) => setForm({...form, noteRetour: e.target.value})}
              placeholder="Problèmes constatés, points à vérifier..."
              className="form-input"
              rows="4"
            />
          </div>

          <p className="modal-info">
            <small>⚠️ Le matériel passera en statut "En Maintenance" avec le motif "Retour Location, à vérifier"</small>
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn btn-success">
            ✅ Valider le Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
