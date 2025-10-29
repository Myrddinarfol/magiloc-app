import React, { useState, useEffect } from 'react';
import './EquipmentTypeDetailsModal.css';

const EquipmentTypeDetailsModal = ({ isOpen, onClose, equipmentType, pieChartMode, month, year, locationData, equipmentData }) => {
  const [level, setLevel] = useState('type'); // 'type', 'model', 'unit'
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState([]);

  // Grouper les équipements par modèle
  useEffect(() => {
    if (!equipmentData || !locationData) return;

    // Filtrer les équipements du type sélectionné
    const typeEquipment = equipmentData.filter(e => (e.designation || e.nom || '').includes(equipmentType));

    // Grouper par modèle
    const modelGroups = {};
    typeEquipment.forEach(eq => {
      const modelName = eq.modele || 'Sans modèle';
      if (!modelGroups[modelName]) {
        modelGroups[modelName] = [];
      }
      modelGroups[modelName].push(eq);
    });

    // Calculer les stats par modèle
    const modelsList = Object.entries(modelGroups).map(([modelName, units]) => {
      const modelLocations = locationData.filter(loc => units.some(u => u.id === loc.equipment_id));
      const ca = modelLocations.reduce((sum, loc) => sum + (loc.ca || loc.caThisMonth || loc.caConfirmedThisMonth || 0), 0);

      return {
        name: modelName,
        units: units,
        locationsCount: modelLocations.length,
        ca: ca
      };
    });

    setModels(modelsList);
  }, [equipmentData, locationData, equipmentType]);

  const handleSelectModel = (modelName) => {
    const model = models.find(m => m.name === modelName);
    setSelectedModel(modelName);
    setSelectedUnits(model?.units || []);
    setLevel('model');
  };

  const handleBackToType = () => {
    setLevel('type');
    setSelectedModel(null);
    setSelectedUnits([]);
  };

  const handleViewUnit = (unit) => {
    setLevel('unit');
  };

  const handleBackToModel = () => {
    setLevel('model');
  };

  if (!isOpen) return null;

  const timeLabel = pieChartMode === 'month'
    ? new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : year;

  return (
    <div className="equipment-details-overlay" onClick={onClose}>
      <div className="equipment-details-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="equipment-details-header">
          <div className="equipment-details-title-section">
            <div className="breadcrumb-nav">
              {level === 'type' && <span className="breadcrumb-active">🔧 {equipmentType}</span>}
              {level === 'model' && (
                <>
                  <button className="breadcrumb-link" onClick={handleBackToType}>🔧 {equipmentType}</button>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-active">{selectedModel}</span>
                </>
              )}
              {level === 'unit' && (
                <>
                  <button className="breadcrumb-link" onClick={handleBackToType}>🔧 {equipmentType}</button>
                  <span className="breadcrumb-separator">›</span>
                  <button className="breadcrumb-link" onClick={handleBackToModel}>{selectedModel}</button>
                  <span className="breadcrumb-separator">›</span>
                  <span className="breadcrumb-active">Détails</span>
                </>
              )}
            </div>
            <p className="equipment-details-period">Période: {timeLabel}</p>
          </div>
          <button className="equipment-details-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="equipment-details-content">
          {/* TYPE LEVEL */}
          {level === 'type' && (
            <>
              <h3 className="section-title">📦 Modèles disponibles</h3>
              <div className="models-grid">
                {models.length === 0 ? (
                  <div className="no-data-message">Aucun modèle trouvé</div>
                ) : (
                  models.map((model, idx) => (
                    <div
                      key={idx}
                      className="model-card"
                      onClick={() => handleSelectModel(model.name)}
                    >
                      <h4 className="model-name">{model.name}</h4>
                      <div className="model-stats">
                        <div className="stat-mini">
                          <span className="stat-label">Unités</span>
                          <span className="stat-value">{model.units.length}</span>
                        </div>
                        <div className="stat-mini">
                          <span className="stat-label">Locations</span>
                          <span className="stat-value">{model.locationsCount}</span>
                        </div>
                        <div className="stat-mini">
                          <span className="stat-label">CA</span>
                          <span className="stat-value">{model.ca.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                      <div className="model-arrow">›</div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* MODEL LEVEL */}
          {level === 'model' && selectedModel && (
            <>
              <h3 className="section-title">🔧 Matériels du modèle "{selectedModel}"</h3>
              <div className="units-table-wrapper">
                <table className="units-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Numéro de série</th>
                      <th>État</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUnits.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="no-data-cell">Aucun matériel</td>
                      </tr>
                    ) : (
                      selectedUnits.map((unit, idx) => (
                        <tr key={idx}>
                          <td className="ref-cell">{unit.cmu || unit.id || 'N/A'}</td>
                          <td>{unit.numerSerie || unit.num_serie || '-'}</td>
                          <td><span className={`state-badge state-${unit.etat || 'unknown'}`}>{unit.etat || 'Bon'}</span></td>
                          <td><span className={`status-badge status-${unit.statut || 'unknown'}`}>{unit.statut || '-'}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentTypeDetailsModal;
