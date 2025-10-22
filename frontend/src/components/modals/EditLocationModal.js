import React, { useState, useEffect } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const EditLocationModal = ({ equipment, onClose, onSuccess }) => {
  const { showToast, editTechInfoFormData, setEditTechInfoFormData } = useUI();
  const defaultForm = {
    client: '',
    debutLocation: '',
    finLocationTheorique: '',
    departEnlevement: '',
    numeroOffre: '',
    notesLocation: '',
    estLongDuree: false
  };
  const [form, setForm] = useState(defaultForm);

  // Initialize form with existing data or preserved data
  useEffect(() => {
    if (editTechInfoFormData) {
      // Restore from context if available
      setForm(editTechInfoFormData);
    } else if (equipment) {
      // Load from equipment if no preserved data
      setForm({
        client: equipment.client || '',
        debutLocation: equipment.debutLocation || '',
        finLocationTheorique: equipment.finLocationTheorique || '',
        departEnlevement: equipment.departEnlevement || '',
        numeroOffre: equipment.numeroOffre || '',
        notesLocation: equipment.notesLocation || '',
        estLongDuree: equipment.estLongDuree === true || equipment.estLongDuree === 1
      });
    }
  }, [equipment]);

  // Persist form data to context on every change
  const updateForm = (newForm) => {
    setForm(newForm);
    setEditTechInfoFormData(newForm);
  };

  const validateDateRange = () => {
    if (form.debutLocation && form.finLocationTheorique) {
      const debut = new Date(form.debutLocation);
      const fin = new Date(form.finLocationTheorique);
      if (debut > fin) {
        showToast('La date de fin théorique doit être après la date de début', 'error');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!form.client.trim()) {
      showToast('Veuillez saisir le nom du client', 'warning');
      return;
    }
    if (!validateDateRange()) {
      return;
    }

    try {
      console.log('🔄 Modification des informations de location pour:', equipment?.designation);

      await equipmentService.update(equipment.id, {
        client: form.client.trim(),
        debutLocation: form.debutLocation || null,
        finLocationTheorique: form.finLocationTheorique || null,
        departEnlevement: form.departEnlevement || null,
        numeroOffre: form.numeroOffre.trim() || null,
        notesLocation: form.notesLocation.trim() || null,
        estLongDuree: form.estLongDuree
      });

      console.log('✅ Informations de location modifiées');
      showToast('Informations de location modifiées avec succès !', 'success');
      setEditTechInfoFormData(null); // Clear preserved data on success
      onClose();
      if (onSuccess) onSuccess('stay-on-detail'); // Rester sur la fiche détail
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors de la modification: ${error.message}`, 'error');
    }
  };

  if (!equipment) return null;

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal">
        <div className="modal-header">
          <h2>📝 Modifier les Informations de Location</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Modifier les informations de location pour <strong>{equipment.designation} {equipment.cmu}</strong>
          </p>

          <div className="form-group">
            <label htmlFor="client-input">Client * :</label>
            <input
              id="client-input"
              type="text"
              value={form.client}
              onChange={(e) => updateForm({...form, client: e.target.value})}
              placeholder="Nom du client"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="debut-location-input">Début Location :</label>
            <input
              id="debut-location-input"
              type="date"
              value={form.debutLocation}
              onChange={(e) => updateForm({...form, debutLocation: e.target.value})}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fin-location-input">Fin Théorique :</label>
            <input
              id="fin-location-input"
              type="date"
              value={form.finLocationTheorique}
              onChange={(e) => updateForm({...form, finLocationTheorique: e.target.value})}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="depart-enlevement-input">📤 Départ/Enlèvement :</label>
            <input
              id="depart-enlevement-input"
              type="date"
              value={form.departEnlevement}
              onChange={(e) => updateForm({...form, departEnlevement: e.target.value})}
              className="form-input"
            />
            <small style={{color: '#9ca3af', marginTop: '4px', display: 'block'}}>
              Date à titre indicatif (expédition ou enlèvement client)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="numero-offre-input">N° Offre :</label>
            <input
              id="numero-offre-input"
              type="text"
              value={form.numeroOffre}
              onChange={(e) => updateForm({...form, numeroOffre: e.target.value})}
              placeholder="Ex: OFF-2025-001"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes-input">Notes :</label>
            <textarea
              id="notes-input"
              value={form.notesLocation}
              onChange={(e) => updateForm({...form, notesLocation: e.target.value})}
              placeholder="Notes complémentaires..."
              className="form-input"
              rows="4"
            />
          </div>

          <div className="form-group" style={{marginTop: '20px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px'}}>
              <input
                type="checkbox"
                id="long-duration-input"
                checked={form.estLongDuree}
                onChange={(e) => updateForm({...form, estLongDuree: e.target.checked})}
                style={{cursor: 'pointer', width: '18px', height: '18px'}}
              />
              <span>📊 Location Longue Durée (-20% remise)</span>
            </label>
          </div>

          <p className="modal-info">
            <small>* Champ obligatoire</small>
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn btn-confirm">
            ✅ Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLocationModal;
