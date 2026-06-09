import React, { useState } from 'react';
import './AddEquipmentModal.css';

const AddEquipmentModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    designation: '',
    numero_serie: '',
    cmu: '',
    statut: 'conforme',
    observations: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.designation.trim()) {
      newErrors.designation = 'Désignation requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onAdd({
      designation: formData.designation,
      numero_serie: formData.numero_serie,
      cmu: formData.cmu,
      statut: formData.statut,
      observations: formData.observations
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-equipment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔍 Ajouter un Équipement</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Désignation */}
          <div className="form-group">
            <label htmlFor="designation">Désignation *</label>
            <input
              id="designation"
              type="text"
              name="designation"
              placeholder="Ex: Palan électrique 1000kg"
              value={formData.designation}
              onChange={handleInputChange}
              className={errors.designation ? 'input-error' : ''}
            />
            {errors.designation && (
              <span className="error-text">{errors.designation}</span>
            )}
          </div>

          {/* Numéro de série */}
          <div className="form-group">
            <label htmlFor="numero_serie">N° de Série</label>
            <input
              id="numero_serie"
              type="text"
              name="numero_serie"
              placeholder="Ex: ABC123456"
              value={formData.numero_serie}
              onChange={handleInputChange}
            />
          </div>

          {/* CMU / Capacité */}
          <div className="form-group">
            <label htmlFor="cmu">CMU / Capacité</label>
            <input
              id="cmu"
              type="text"
              name="cmu"
              placeholder="Ex: 1000kg, 500L"
              value={formData.cmu}
              onChange={handleInputChange}
            />
          </div>

          {/* Statut */}
          <div className="form-group">
            <label>Statut Initial</label>
            <div className="status-selector">
              <button
                type="button"
                className={`status-option ${formData.statut === 'conforme' ? 'active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'statut', value: 'conforme' } })}
              >
                ✅ Conforme
              </button>
              <button
                type="button"
                className={`status-option ${formData.statut === 'non_conforme' ? 'active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'statut', value: 'non_conforme' } })}
              >
                ⚠️ Non conforme
              </button>
              <button
                type="button"
                className={`status-option ${formData.statut === 'a_remplacer' ? 'active' : ''}`}
                onClick={() => handleInputChange({ target: { name: 'statut', value: 'a_remplacer' } })}
              >
                🔴 À remplacer
              </button>
            </div>
          </div>

          {/* Observations */}
          <div className="form-group">
            <label htmlFor="observations">Observations</label>
            <textarea
              id="observations"
              name="observations"
              placeholder="Notes sur cet équipement..."
              value={formData.observations}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-gray"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              ✅ Ajouter Équipement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentModal;
