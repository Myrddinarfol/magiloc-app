import React, { useState } from 'react';
import { getCertificatLink } from '../../utils/vgpHelpers';
import { equipmentService } from '../../services/equipmentService';

const CertificatModal = ({ equipment, onClose, onSave }) => {
  const [certificatInput, setCertificatInput] = useState(equipment?.certificat || '');

  const handleSave = async () => {
    if (!certificatInput.trim()) {
      alert('Veuillez saisir un numéro de certificat ou une URL');
      return;
    }

    try {
      await equipmentService.update(equipment.id, {
        certificat: certificatInput.trim()
      });

      onSave();
      setCertificatInput('');
      alert('Certificat mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du certificat');
    }
  };

  return (
    <div className="release-notes-overlay">
      <div className="certificat-modal">
        <div className="modal-header">
          <h2>📎 {equipment?.certificat ? 'Modifier' : 'Ajouter'} un certificat</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Vous pouvez saisir :
          </p>
          <ul className="modal-info-list">
            <li>Un <strong>numéro CML</strong> (ex: CML048065) pour générer automatiquement le lien VTIC</li>
            <li>Une <strong>URL Google Drive</strong> pour un certificat interne</li>
          </ul>

          <div className="form-group">
            <label htmlFor="certificat-input">Certificat ou URL :</label>
            <input
              id="certificat-input"
              type="text"
              value={certificatInput}
              onChange={(e) => setCertificatInput(e.target.value)}
              placeholder="Ex: CML048065 ou https://drive.google.com/..."
              className="form-input"
              autoFocus
            />
          </div>

          {certificatInput && getCertificatLink(certificatInput) && (
            <div className="preview-link">
              <span>🔗 Aperçu du lien : </span>
              <a href={getCertificatLink(certificatInput)} target="_blank" rel="noopener noreferrer">
                {getCertificatLink(certificatInput)}
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Annuler
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatModal;
