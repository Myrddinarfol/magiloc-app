import React, { useState } from 'react';
import './AddPartModal.css';

const AddPartModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    reference: '',
    designation: '',
    quantite: 1,
    cout_unitaire: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantite' ? Math.max(0.5, parseFloat(value) || 1) : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuantityChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      quantite: Math.max(0.5, prev.quantite + delta)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reference.trim()) {
      newErrors.reference = 'Référence requise';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Désignation requise';
    }

    if (!formData.quantite || formData.quantite <= 0) {
      newErrors.quantite = 'Quantité invalide';
    }

    if (!formData.cout_unitaire || parseFloat(formData.cout_unitaire) < 0) {
      newErrors.cout_unitaire = 'Coût invalide';
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
      reference: formData.reference,
      designation: formData.designation,
      quantite: formData.quantite,
      cout_unitaire: parseFloat(formData.cout_unitaire)
    });
  };

  const totalPrice = (formData.quantite * (parseFloat(formData.cout_unitaire) || 0)).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-part-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔧 Ajouter une Pièce Changée</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Référence */}
          <div className="form-group">
            <label htmlFor="reference">Référence *</label>
            <input
              id="reference"
              type="text"
              name="reference"
              placeholder="Ex: REF-001"
              value={formData.reference}
              onChange={handleInputChange}
              className={errors.reference ? 'input-error' : ''}
            />
            {errors.reference && (
              <span className="error-text">{errors.reference}</span>
            )}
          </div>

          {/* Désignation */}
          <div className="form-group">
            <label htmlFor="designation">Désignation *</label>
            <input
              id="designation"
              type="text"
              name="designation"
              placeholder="Ex: Câble acier 6mm"
              value={formData.designation}
              onChange={handleInputChange}
              className={errors.designation ? 'input-error' : ''}
            />
            {errors.designation && (
              <span className="error-text">{errors.designation}</span>
            )}
          </div>

          {/* Quantité */}
          <div className="form-group">
            <label htmlFor="quantite">Quantité *</label>
            <div className="quantity-control">
              <button
                type="button"
                className="qty-btn minus"
                onClick={() => handleQuantityChange(-0.5)}
              >
                −
              </button>
              <input
                id="quantite"
                type="number"
                name="quantite"
                placeholder="1"
                value={formData.quantite}
                onChange={handleInputChange}
                step="0.5"
                min="0.5"
                className={`qty-input ${errors.quantite ? 'input-error' : ''}`}
              />
              <button
                type="button"
                className="qty-btn plus"
                onClick={() => handleQuantityChange(0.5)}
              >
                +
              </button>
            </div>
            {errors.quantite && (
              <span className="error-text">{errors.quantite}</span>
            )}
          </div>

          {/* Coût Unitaire */}
          <div className="form-group">
            <label htmlFor="cout_unitaire">Coût Unitaire (€) *</label>
            <input
              id="cout_unitaire"
              type="number"
              name="cout_unitaire"
              placeholder="0.00"
              value={formData.cout_unitaire}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={errors.cout_unitaire ? 'input-error' : ''}
            />
            {errors.cout_unitaire && (
              <span className="error-text">{errors.cout_unitaire}</span>
            )}
          </div>

          {/* Total Preview */}
          <div className="total-preview">
            <span className="label">Total :</span>
            <span className="value">{totalPrice}€</span>
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
              ✅ Ajouter Pièce
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPartModal;
