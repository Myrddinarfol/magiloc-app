import React, { useState, useMemo } from 'react';
import { FEATURED_EQUIPMENT_PERIODS, getTopRentalModels } from '../utils/featuredEquipmentUtils';
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
  const [designationFilter, setDesignationFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [cmuFilter, setCmuFilter] = useState('');
  const [lengthFilter, setLengthFilter] = useState('');

  // Obtenir les équipements uniques avec infos, groupés par désignation
  const uniqueEquipment = useMemo(() => {
    const seen = new Set();
    const items = [];

    equipmentData.forEach(eq => {
      const designation = eq.designation?.trim() || '';
      const modele = eq.modele?.toUpperCase().trim() || '';
      const key = `${designation}|${modele}`;

      if (designation && modele && !seen.has(key)) {
        seen.add(key);
        items.push({
          designation: designation,
          modele: modele,
          cmu: eq.cmu || '',
          longueur: eq.longueur || ''
        });
      }
    });

    return items.sort((a, b) => {
      const designationCompare = a.designation.localeCompare(b.designation);
      return designationCompare !== 0 ? designationCompare : a.modele.localeCompare(b.modele);
    });
  }, [equipmentData]);

  // Obtenir les valeurs uniques pour les dropdowns
  const filterOptions = useMemo(() => {
    return {
      designations: [...new Set(uniqueEquipment.map(eq => eq.designation))].sort(),
      models: [...new Set(uniqueEquipment.map(eq => eq.modele))].sort(),
      cmus: [...new Set(uniqueEquipment.map(eq => eq.cmu).filter(Boolean))].sort(),
      lengths: [...new Set(uniqueEquipment.map(eq => eq.longueur).filter(Boolean))].sort()
    };
  }, [uniqueEquipment]);

  // Filtrer et rechercher
  const filteredEquipment = useMemo(() => {
    return uniqueEquipment.filter(eq => {
      // Appliquer les filtres déroulants
      if (designationFilter && eq.designation !== designationFilter) return false;
      if (modelFilter && eq.modele !== modelFilter) return false;
      if (cmuFilter && eq.cmu !== cmuFilter) return false;
      if (lengthFilter && eq.longueur !== lengthFilter) return false;

      // Appliquer la recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          eq.designation.toLowerCase().includes(searchLower) ||
          eq.modele.toLowerCase().includes(searchLower) ||
          eq.cmu.toLowerCase().includes(searchLower) ||
          eq.longueur.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [uniqueEquipment, searchTerm, designationFilter, modelFilter, cmuFilter, lengthFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDesignationFilter('');
    setModelFilter('');
    setCmuFilter('');
    setLengthFilter('');
  };

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
            <h3>Sélectionner manuellement (max 8)</h3>

            {/* Barre de recherche */}
            <input
              type="text"
              placeholder="Rechercher par modèle, désignation, CMU, longueur..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Filtres déroulants */}
            <div className="filters-container customizer-filters">
              <div className="filter-group">
                <label>Désignation</label>
                <select
                  className="filter-select"
                  value={designationFilter}
                  onChange={(e) => setDesignationFilter(e.target.value)}
                >
                  <option value="">Tous</option>
                  {filterOptions.designations.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Modèle</label>
                <select
                  className="filter-select"
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                >
                  <option value="">Tous</option>
                  {filterOptions.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>CMU</label>
                <select
                  className="filter-select"
                  value={cmuFilter}
                  onChange={(e) => setCmuFilter(e.target.value)}
                >
                  <option value="">Tous</option>
                  {filterOptions.cmus.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Longueur</label>
                <select
                  className="filter-select"
                  value={lengthFilter}
                  onChange={(e) => setLengthFilter(e.target.value)}
                >
                  <option value="">Tous</option>
                  {filterOptions.lengths.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <button className="btn-clear-filters" onClick={handleClearFilters} data-tooltip="Réinitialiser les filtres">
                ✕ Clear
              </button>
            </div>

            <div className="selection-header">
              <p className="selection-info">
                Sélectionnés: {manualSelection.length}/8 | Résultats: {filteredEquipment.length}
              </p>
              {manualSelection.length > 0 && (
                <button className="btn-clear-all" onClick={() => setManualSelection([])}>
                  Désélectionner tout
                </button>
              )}
            </div>

            {/* Tableau récapitulatif */}
            {manualSelection.length > 0 && (
              <div className="selection-summary">
                <h4>Matériels sélectionnés</h4>
                <div className="summary-table">
                  {manualSelection.map(modelName => {
                    const eq = uniqueEquipment.find(e => e.modele === modelName);
                    return (
                      <div key={modelName} className="summary-row">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleModel(modelName)}
                          className="summary-checkbox"
                        />
                        <div className="summary-info">
                          <div className="summary-designation">{eq?.designation || modelName}</div>
                          <div className="summary-specs">
                            {eq?.cmu && <span>{eq.cmu}</span>}
                            {eq?.longueur && <span>{eq.longueur}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grille d'équipement */}
            <div className="equipment-list">
              {filteredEquipment.length > 0 ? (
                filteredEquipment.map(eq => (
                  <div
                    key={`${eq.designation}|${eq.modele}`}
                    className={`equipment-item ${manualSelection.includes(eq.modele) ? 'selected' : ''} ${manualSelection.length >= 8 && !manualSelection.includes(eq.modele) ? 'disabled' : ''}`}
                    onClick={() => toggleModel(eq.modele)}
                  >
                    <div className="equipment-checkbox">
                      {manualSelection.includes(eq.modele) ? '✓' : ''}
                    </div>
                    <div className="equipment-info">
                      <div className="equipment-designation">{eq.designation}</div>
                      <div className="equipment-model">🔧 {eq.modele}</div>
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
