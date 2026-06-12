import React, { useState, useMemo } from 'react';
import { FEATURED_EQUIPMENT_PERIODS, getTopRentalModels } from '../utils/featuredEquipmentUtils';
import { smartSearch } from '../utils/smartSearch';
import './FeaturedEquipmentCustomizer.css';

function FeaturedEquipmentCustomizer({
  isOpen,
  onClose,
  equipmentData,
  selectedModels,
  onSave
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [manualSelection, setManualSelection] = useState(selectedModels);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, designation, model, cmu, length

  // Obtenir les équipements uniques avec infos
  const uniqueEquipment = useMemo(() => {
    const seen = new Set();
    const items = [];

    equipmentData.forEach(eq => {
      const key = eq.modele?.toUpperCase().trim() || '';
      if (key && !seen.has(key)) {
        seen.add(key);
        items.push({
          modele: key,
          designation: eq.designation || '',
          cmu: eq.cmu || '',
          longueur: eq.longueur || ''
        });
      }
    });

    return items.sort((a, b) => a.modele.localeCompare(b.modele));
  }, [equipmentData]);

  // Filtrer et rechercher
  const filteredEquipment = useMemo(() => {
    if (!searchTerm) return uniqueEquipment;

    return uniqueEquipment.filter(eq => {
      const searchLower = searchTerm.toLowerCase();

      if (filterType === 'all') {
        return smartSearch(eq, searchTerm);
      }

      switch (filterType) {
        case 'designation':
          return eq.designation.toLowerCase().includes(searchLower);
        case 'model':
          return eq.modele.toLowerCase().includes(searchLower);
        case 'cmu':
          return eq.cmu.toLowerCase().includes(searchLower);
        case 'length':
          return eq.longueur.toLowerCase().includes(searchLower);
        default:
          return true;
      }
    });
  }, [uniqueEquipment, searchTerm, filterType]);

  const handlePeriodClick = (days) => {
    if (selectedPeriod === days) {
      // Désélectionner si déjà sélectionné
      setSelectedPeriod(null);
    } else {
      const topModels = getTopRentalModels(equipmentData, days, 8);
      setManualSelection(topModels);
      setSelectedPeriod(days);
      setSearchTerm('');
    }
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
            <p className="section-note">Cliquez à nouveau pour désélectionner</p>
            <div className="period-buttons">
              {FEATURED_EQUIPMENT_PERIODS.map(period => (
                <button
                  key={period.days}
                  className={`period-btn ${selectedPeriod === period.days ? 'active' : ''}`}
                  onClick={() => handlePeriodClick(period.days)}
                  data-tooltip={`${selectedPeriod === period.days ? 'Désélectionner' : 'Afficher'} ${period.label.toLowerCase()}`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection manuelle */}
          <div className="customizer-section">
            <h3>Ou sélectionner manuellement (max 8)</h3>

            {/* Barre de recherche */}
            <div className="search-section">
              <input
                type="text"
                placeholder="Rechercher par modèle, désignation, CMU, longueur..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="filter-tabs">
                <button
                  className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  Tous
                </button>
                <button
                  className={`filter-tab ${filterType === 'model' ? 'active' : ''}`}
                  onClick={() => setFilterType('model')}
                >
                  Modèle
                </button>
                <button
                  className={`filter-tab ${filterType === 'designation' ? 'active' : ''}`}
                  onClick={() => setFilterType('designation')}
                >
                  Désignation
                </button>
                <button
                  className={`filter-tab ${filterType === 'cmu' ? 'active' : ''}`}
                  onClick={() => setFilterType('cmu')}
                >
                  CMU
                </button>
                <button
                  className={`filter-tab ${filterType === 'length' ? 'active' : ''}`}
                  onClick={() => setFilterType('length')}
                >
                  Longueur
                </button>
              </div>
            </div>

            <p className="selection-info">
              Sélectionnés: {manualSelection.length}/8 | Résultats: {filteredEquipment.length}
            </p>

            {/* Grille d'équipement */}
            <div className="equipment-list">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map(eq => (
                  <div
                    key={eq.modele}
                    className={`equipment-item ${manualSelection.includes(eq.modele) ? 'selected' : ''} ${manualSelection.length >= 8 && !manualSelection.includes(eq.modele) ? 'disabled' : ''}`}
                    onClick={() => toggleModel(eq.modele)}
                  >
                    <div className="equipment-checkbox">
                      {manualSelection.includes(eq.modele) ? '✓' : ''}
                    </div>
                    <div className="equipment-info">
                      <div className="equipment-model">{eq.modele}</div>
                      {eq.designation && <div className="equipment-detail">📋 {eq.designation}</div>}
                      <div className="equipment-specs">
                        {eq.cmu && <span className="spec-badge">CMU: {eq.cmu}</span>}
                        {eq.longueur && <span className="spec-badge">L: {eq.longueur}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">Aucun résultat ne correspond à votre recherche</div>
              )}
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
