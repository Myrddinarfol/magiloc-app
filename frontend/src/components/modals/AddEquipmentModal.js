import React, { useState } from 'react';
import { equipmentService } from '../../services/equipmentService';
import { useUI } from '../../hooks/useUI';

const AddEquipmentModal = ({ onClose, onSuccess }) => {
  const { showToast } = useUI();
  const [form, setForm] = useState({
    designation: '',
    cmu: '',
    modele: '',
    marque: '',
    longueur: '',
    numeroSerie: '',
    prixHT: '',
    etat: '',
    dernierVGP: '',
    prochainVGP: '',
    certificat: '',
    infosComplementaires: ''
  });

  // Calcul automatique prochain VGP (+6 mois)
  const handleDernierVGPChange = (value) => {
    setForm({...form, dernierVGP: value});

    if (value) {
      const date = new Date(value);
      date.setMonth(date.getMonth() + 6);
      const prochainVGP = date.toLocaleDateString('fr-FR');
      setForm(prev => ({...prev, dernierVGP: value, prochainVGP}));
    }
  };

  const handleSubmit = async () => {
    if (!form.designation || !form.numeroSerie) {
      showToast('Veuillez renseigner au minimum la Désignation et le N° de Série', 'warning');
      return;
    }

    try {
      console.log('➕ Ajout d\'un nouvel équipement:', form);

      await equipmentService.create({
        ...form,
        statut: 'Sur Parc'
      });

      console.log('✅ Équipement ajouté');
      onSuccess();
      setForm({
        designation: '',
        cmu: '',
        modele: '',
        marque: '',
        longueur: '',
        numeroSerie: '',
        prixHT: '',
        etat: '',
        dernierVGP: '',
        prochainVGP: '',
        certificat: '',
        infosComplementaires: ''
      });
      showToast('Équipement ajouté avec succès !', 'success');
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast(`Erreur lors de l'ajout: ${error.message}`, 'error');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>➕ Ajouter un Nouvel Équipement</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Remplissez les informations du nouveau matériel
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="designation-input">Désignation * :</label>
              <input
                id="designation-input"
                type="text"
                value={form.designation}
                onChange={(e) => setForm({...form, designation: e.target.value})}
                placeholder="Ex: PALAN ELECTRIQUE"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cmu-input">CMU :</label>
              <input
                id="cmu-input"
                type="text"
                value={form.cmu}
                onChange={(e) => setForm({...form, cmu: e.target.value})}
                placeholder="Ex: 1T"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="modele-add-input">Modèle :</label>
              <input
                id="modele-add-input"
                type="text"
                value={form.modele}
                onChange={(e) => setForm({...form, modele: e.target.value})}
                placeholder="Modèle"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="marque-add-input">Marque :</label>
              <input
                id="marque-add-input"
                type="text"
                value={form.marque}
                onChange={(e) => setForm({...form, marque: e.target.value})}
                placeholder="Marque"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longueur-add-input">Longueur :</label>
              <input
                id="longueur-add-input"
                type="text"
                value={form.longueur}
                onChange={(e) => setForm({...form, longueur: e.target.value})}
                placeholder="Ex: 14m"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero-serie-add-input">N° Série * :</label>
              <input
                id="numero-serie-add-input"
                type="text"
                value={form.numeroSerie}
                onChange={(e) => setForm({...form, numeroSerie: e.target.value})}
                placeholder="Numéro de série"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prix-ht-add-input">Prix HT/J :</label>
              <input
                id="prix-ht-add-input"
                type="number"
                step="0.01"
                value={form.prixHT}
                onChange={(e) => setForm({...form, prixHT: e.target.value})}
                placeholder="Ex: 150.00"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="etat-add-input">État :</label>
              <select
                id="etat-add-input"
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

            <div className="form-group">
              <label htmlFor="dernier-vgp-add-input">Dernier VGP :</label>
              <input
                id="dernier-vgp-add-input"
                type="date"
                value={form.dernierVGP}
                onChange={(e) => handleDernierVGPChange(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prochain-vgp-add-input">Prochain VGP (auto) :</label>
              <input
                id="prochain-vgp-add-input"
                type="text"
                value={form.prochainVGP}
                readOnly
                placeholder="Calculé automatiquement"
                className="form-input"
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="certificat-add-input">Certificat / V-TIC :</label>
              <input
                id="certificat-add-input"
                type="text"
                value={form.certificat}
                onChange={(e) => setForm({...form, certificat: e.target.value})}
                placeholder="Ex: CML123456"
                className="form-input"
              />
            </div>
          </div>

          {/* Infos complémentaires */}
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label htmlFor="infos-add-input">Infos complémentaires :</label>
            <textarea
              id="infos-add-input"
              value={form.infosComplementaires}
              onChange={(e) => setForm({...form, infosComplementaires: e.target.value})}
              rows="3"
              placeholder="Informations additionnelles..."
              className="form-input"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <p className="modal-info">
            <small>* Champs obligatoires</small>
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            ➕ Ajouter l'Équipement
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEquipmentModal;
