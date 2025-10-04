import React, { useState } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const EditTechInfoModal = ({ equipment, onClose, onSuccess }) => {
  const { showToast } = useUI();
  const [form, setForm] = useState({
    modele: equipment?.modele || '',
    marque: equipment?.marque || '',
    longueur: equipment?.longueur || '',
    numeroSerie: equipment?.numeroSerie || '',
    prixHT: equipment?.prixHT || '',
    etat: equipment?.etat || ''
  });

  const handleSubmit = async () => {
    try {
      console.log('💾 Sauvegarde des informations techniques pour:', equipment?.designation);

      await equipmentService.update(equipment.id, {
        modele: form.modele,
        marque: form.marque,
        longueur: form.longueur,
        numeroSerie: form.numeroSerie,
        prixHT: form.prixHT,
        etat: form.etat
      });

      console.log('✅ Informations techniques mises à jour');
      onSuccess();
      showToast('Informations techniques mises à jour avec succès !', 'success');
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors de la mise à jour: ${error.message}`, 'error');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal">
        <div className="modal-header">
          <h2>📜 Modifier les Informations Techniques</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Modification des informations techniques pour <strong>{equipment?.designation} {equipment?.cmu}</strong>
          </p>

          <div className="form-group">
            <label htmlFor="modele-input">Modèle :</label>
            <input
              id="modele-input"
              type="text"
              value={form.modele}
              onChange={(e) => setForm({...form, modele: e.target.value})}
              placeholder="Modèle"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="marque-input">Marque :</label>
            <input
              id="marque-input"
              type="text"
              value={form.marque}
              onChange={(e) => setForm({...form, marque: e.target.value})}
              placeholder="Marque"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="longueur-input">Longueur :</label>
            <input
              id="longueur-input"
              type="text"
              value={form.longueur}
              onChange={(e) => setForm({...form, longueur: e.target.value})}
              placeholder="Ex: 14m"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numero-serie-input">N° Série :</label>
            <input
              id="numero-serie-input"
              type="text"
              value={form.numeroSerie}
              onChange={(e) => setForm({...form, numeroSerie: e.target.value})}
              placeholder="Numéro de série"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prix-ht-input">Prix HT/J :</label>
            <input
              id="prix-ht-input"
              type="number"
              step="0.01"
              value={form.prixHT}
              onChange={(e) => setForm({...form, prixHT: e.target.value})}
              placeholder="Ex: 150.00"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="etat-input">État :</label>
            <select
              id="etat-input"
              value={form.etat}
              onChange={(e) => setForm({...form, etat: e.target.value})}
              className="form-input"
            >
              <option value="">-- Sélectionner --</option>
              <option value="Neuf">Neuf</option>
              <option value="Bon">Bon</option>
              <option value="Moyen">Moyen</option>
              <option value="Vieillissant">Vieillissant</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTechInfoModal;
