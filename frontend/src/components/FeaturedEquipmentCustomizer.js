import React, { useState } from 'react';
import { FEATURED_EQUIPMENT_PERIODS, getTopRentalModels } from '../utils/featuredEquipmentUtils';
import './FeaturedEquipmentCustomizer.css';

function FeaturedEquipmentCustomizer({
  isOpen,
  onClose,
  equipmentData,
  selectedModels,
  onSave
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [manualSelection, setManualSelection] = useState(selectedModels);

  // Obtenir les modèles uniques
  const uniqueModels = [...new Set(equipmentData.map(eq => eq.modele).filter(Boolean))]
    .map(m => m.toUpperCase().trim())
    .sort();

  const handlePeriodClick = (days) => {
    const topModels = getTopRentalModels(equipmentData, days, 8);
    setManualSelection(topModels);
    setSelectedPeriod(days);
  };

  const toggleModel = (model) => {
    setManualSelection(prev => {
      if (prev.includes(model)) {
        return prev.filter(m => m !== model);
      } else if (prev.length < 8) {
        return [...prev, model];
      }
      return prev;
    });
  };

  const handleSave = () => {
    onSave(manualSelection);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="customizer-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="customizer-modal">
        <div className="customizer-header">
          <h2>Personnaliser les Matériels Phares</h2>
          <button className="customizer-close" onClick={onClose}>✕</button>
        </div>

        <div className="customizer-body">
          {/* Filtres temporels */}
          <div className="customizer-section">
            <h3>Filtrer par période de location</h3>
            <div className="period-buttons">
              {FEATURED_EQUIPMENT_PERIODS.map(period => (
                <button
                  key={period.days}
                  className={`period-btn ${selectedPeriod === period.days ? 'active' : ''}`}
                  onClick={() => handlePeriodClick(period.days)}
                  data-tooltip={`Afficher les ${period.label.toLowerCase()}`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection manuelle */}
          <div className="customizer-section">
            <h3>Ou sélectionner manuellement (max 8)</h3>
            <p className="selection-info">
              Sélectionnés: {manualSelection.length}/8
            </p>
            <div className="models-grid">
              {uniqueModels.map(model => (
                <button
                  key={model}
                  className={`model-btn ${manualSelection.includes(model) ? 'selected' : ''} ${manualSelection.length >= 8 && !manualSelection.includes(model) ? 'disabled' : ''}`}
                  onClick={() => toggleModel(model)}
                  disabled={manualSelection.length >= 8 && !manualSelection.includes(model)}
                >
                  <span className="checkbox">
                    {manualSelection.includes(model) ? '✓' : ''}
                  </span>
                  {model}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="customizer-footer">
          <button className="btn-cancel" onClick={onClose}>Annuler</button>
          <button className="btn-save" onClick={handleSave}>Appliquer</button>
        </div>
      </div>
    </>
  );
}

export default FeaturedEquipmentCustomizer;
