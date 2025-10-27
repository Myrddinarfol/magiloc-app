import React, { useState, useEffect } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const ReservationModal = ({ equipment, onClose, onSuccess }) => {
  const { showToast, reservationFormData, setReservationFormData } = useUI();
  const defaultForm = {
    client: '',
    debutLocation: '',
    finLocationTheorique: '',
    departEnlevement: '',
    numeroOffre: '',
    notesLocation: '',
    estLongDuree: false,
    estPret: false
  };
  const [form, setForm] = useState(reservationFormData || defaultForm);

  // Restore form data from context on mount
  useEffect(() => {
    if (reservationFormData) {
      setForm(reservationFormData);
    }
  }, []);

  // Persist form data to context on every change
  const updateForm = (newForm) => {
    setForm(newForm);
    setReservationFormData(newForm);
  };

  const handleSubmit = async () => {
    if (!form.client.trim()) {
      showToast('Veuillez saisir le nom du client', 'warning');
      return;
    }

    try {
      console.log('🔄 Création de réservation pour:', equipment?.designation);

      await equipmentService.update(equipment.id, {
        statut: 'En Réservation',
        client: form.client.trim(),
        debutLocation: form.debutLocation || null,
        finLocationTheorique: form.finLocationTheorique || null,
        departEnlevement: form.departEnlevement || null,
        numeroOffre: form.numeroOffre.trim() || null,
        notesLocation: form.notesLocation.trim() || null,
        estLongDuree: form.estLongDuree,
        estPret: form.estPret
      });

      console.log('✅ Réservation créée');
      showToast('Réservation créée avec succès !', 'success');
      setForm(defaultForm);
      setReservationFormData(null); // Clear preserved data on success
      onClose();
      onSuccess('en-offre'); // Naviguer vers réservations
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors de la création de la réservation: ${error.message}`, 'error');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal" style={{maxWidth: '600px'}}>
        <div className="modal-header">
          <h2>📅 Créer une Réservation</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Remplissez les informations de réservation pour <strong>{equipment?.designation} {equipment?.cmu}</strong>
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

          <div className="form-group" style={{marginTop: '12px'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px'}}>
              <input
                type="checkbox"
                id="pret-input"
                checked={form.estPret}
                onChange={(e) => updateForm({...form, estPret: e.target.checked})}
                style={{cursor: 'pointer', width: '18px', height: '18px'}}
              />
              <span>🎁 Matériel en Prêt (Non facturé)</span>
            </label>
            <small style={{color: '#9ca3af', marginTop: '4px', display: 'block', marginLeft: '28px'}}>
              Cochez si le matériel est en prêt (SAV, délai de commande, etc.) - ne sera pas inclus dans le CA
            </small>
          </div>

          <p className="modal-info">
            <small>* Champ obligatoire</small>
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn btn-confirm">
            ✅ Valider la Réservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
