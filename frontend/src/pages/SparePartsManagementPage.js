import React, { useEffect, useState } from 'react';
import { useSpareParts } from '../hooks/useSpareParts';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';
import '../pages/SparePartsManagementPage.css';

const SparePartsManagementPage = () => {
  const { spareParts, isLoading, loadSpareParts, addSparePart, updateSparePart, deleteSparePart, setSpareParts } = useSpareParts();
  const { equipmentData } = useEquipment();
  const { showToast } = useUI();
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [filterEquipmentId, setFilterEquipmentId] = useState(null);
  const [mainFilterEquipmentFilters, setMainFilterEquipmentFilters] = useState({
    designation: '',
    cmu: '',
    marque: '',
    modele: ''
  });
  const [formData, setFormData] = useState({
    reference: '',
    designation: '',
    equipment_id: null,
    cost: '',
    quantity: 1,
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    loadSpareParts();
  }, []);

  const [equipmentFilters, setEquipmentFilters] = useState({
    designation: '',
    cmu: '',
    marque: '',
    modele: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'equipment_id' ? (value ? parseInt(value) : null) :
              name === 'quantity' || name === 'cost' ? parseFloat(value) || '' : value
    }));
  };

  const handleFilterChange = (field, value) => {
    setEquipmentFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMainFilterChange = (field, value) => {
    setMainFilterEquipmentFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getMainUniqueValues = (field) => {
    // Filtrer les équipements selon les autres filtres déjà sélectionnés
    // (mais pas selon le champ courant pour éviter d'éliminer ses options)
    const filtered = equipmentData.filter(eq => {
      // Vérifier les filtres des autres champs (pas du champ courant)
      if (field !== 'designation' && mainFilterEquipmentFilters.designation && eq.designation !== mainFilterEquipmentFilters.designation) return false;
      if (field !== 'cmu' && mainFilterEquipmentFilters.cmu && eq.cmu !== mainFilterEquipmentFilters.cmu) return false;
      if (field !== 'marque' && mainFilterEquipmentFilters.marque && eq.marque !== mainFilterEquipmentFilters.marque) return false;
      if (field !== 'modele' && mainFilterEquipmentFilters.modele && eq.modele !== mainFilterEquipmentFilters.modele) return false;
      return true;
    });

    // Récupérer les valeurs uniques pour ce champ
    const values = filtered
      .map(eq => eq[field])
      .filter(Boolean)
      .filter((val, idx, self) => self.indexOf(val) === idx)
      .sort();
    return values;
  };

  const getMainFilteredEquipment = () => {
    return equipmentData.filter(eq => {
      if (mainFilterEquipmentFilters.designation && eq.designation !== mainFilterEquipmentFilters.designation) return false;
      if (mainFilterEquipmentFilters.cmu && eq.cmu !== mainFilterEquipmentFilters.cmu) return false;
      if (mainFilterEquipmentFilters.marque && eq.marque !== mainFilterEquipmentFilters.marque) return false;
      if (mainFilterEquipmentFilters.modele && eq.modele !== mainFilterEquipmentFilters.modele) return false;
      return true;
    });
  };

  const getUniqueValues = (field) => {
    // Filtrer les équipements selon les autres filtres déjà sélectionnés
    // (mais pas selon le champ courant pour éviter d'éliminer ses options)
    const filtered = equipmentData.filter(eq => {
      // Vérifier les filtres des autres champs (pas du champ courant)
      if (field !== 'designation' && equipmentFilters.designation && eq.designation !== equipmentFilters.designation) return false;
      if (field !== 'cmu' && equipmentFilters.cmu && eq.cmu !== equipmentFilters.cmu) return false;
      if (field !== 'marque' && equipmentFilters.marque && eq.marque !== equipmentFilters.marque) return false;
      if (field !== 'modele' && equipmentFilters.modele && eq.modele !== equipmentFilters.modele) return false;
      return true;
    });

    // Récupérer les valeurs uniques pour ce champ
    const values = filtered
      .map(eq => eq[field])
      .filter(Boolean)
      .filter((val, idx, self) => self.indexOf(val) === idx)
      .sort();
    return values;
  };

  const getFilteredEquipment = () => {
    return equipmentData.filter(eq => {
      if (equipmentFilters.designation && eq.designation !== equipmentFilters.designation) return false;
      if (equipmentFilters.cmu && eq.cmu !== equipmentFilters.cmu) return false;
      if (equipmentFilters.marque && eq.marque !== equipmentFilters.marque) return false;
      if (equipmentFilters.modele && eq.modele !== equipmentFilters.modele) return false;
      return true;
    });
  };

  const selectedEquipmentInfo = equipmentData.find(eq => eq.id === formData.equipment_id);

  const handleAddClick = () => {
    setEditingPart(null);
    setFormData({
      reference: '',
      designation: '',
      equipment_id: filterEquipmentId || null,
      cost: '',
      quantity: 1,
      supplier: '',
      notes: ''
    });
    setEquipmentFilters({
      designation: '',
      cmu: '',
      marque: '',
      modele: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (part) => {
    setEditingPart(part);
    setFormData(part);
    setEquipmentFilters({
      designation: '',
      cmu: '',
      marque: '',
      modele: ''
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPart(null);
    setEquipmentFilters({
      designation: '',
      cmu: '',
      marque: '',
      modele: ''
    });
  };

  const handleFormSubmit = async () => {
    // Validation des champs obligatoires
    if (!formData.reference.trim()) {
      showToast('❌ La référence est obligatoire', 'error');
      return;
    }

    if (!formData.designation.trim()) {
      showToast('❌ La désignation est obligatoire', 'error');
      return;
    }

    if (formData.quantity < 1) {
      showToast('❌ La quantité doit être au moins 1', 'error');
      return;
    }

    try {
      if (editingPart) {
        await updateSparePart(editingPart.id, formData);
        showToast('✅ Pièce mise à jour avec succès', 'success');
      } else {
        await addSparePart(formData);
        showToast('✅ Pièce ajoutée avec succès', 'success');
      }
      handleModalClose();
      // Recharger les pièces
      await loadSpareParts();
    } catch (err) {
      showToast(`❌ Erreur: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (partId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pièce ?')) {
      try {
        await deleteSparePart(partId);
        showToast('✅ Pièce supprimée avec succès', 'success');
      } catch (err) {
        showToast(`❌ Erreur: ${err.message}`, 'error');
      }
    }
  };

  const filteredParts = filterEquipmentId
    ? spareParts.filter(p => p.equipment_id === filterEquipmentId)
    : spareParts;

  const getTotalCost = () => {
    return filteredParts.reduce((sum, part) => sum + (part.cost ? parseFloat(part.cost) * (part.quantity || 1) : 0), 0).toFixed(2);
  };

  if (isLoading) {
    return <div className="loading-state">Chargement des pièces détachées...</div>;
  }

  return (
    <div className="spare-parts-management-page">
      <PageHeader
        icon="🔧"
        title="Pièces Détachées"
        subtitle="GESTION DES PIÈCES DE RECHANGE"
        description="Gérez l'inventaire des pièces de rechange, consultez les stocks et les coûts associés à chaque équipement"
      />

      <div className="spare-parts-controls">
        <button className="btn btn-primary" onClick={handleAddClick}>
          ➕ Ajouter une Pièce
        </button>
      </div>

      {/* Sections de filtres intelligentes */}
      <div className="filters-container">
        <select
          value={mainFilterEquipmentFilters.designation}
          onChange={(e) => handleMainFilterChange('designation', e.target.value)}
          className="filter-select"
        >
          <option value="">Toutes les désignations</option>
          {getMainUniqueValues('designation').map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>

        <select
          value={mainFilterEquipmentFilters.cmu}
          onChange={(e) => handleMainFilterChange('cmu', e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les CMU</option>
          {getMainUniqueValues('cmu').map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>

        <select
          value={mainFilterEquipmentFilters.marque}
          onChange={(e) => handleMainFilterChange('marque', e.target.value)}
          className="filter-select"
        >
          <option value="">Toutes les marques</option>
          {getMainUniqueValues('marque').map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>

        <select
          value={mainFilterEquipmentFilters.modele}
          onChange={(e) => handleMainFilterChange('modele', e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les modèles</option>
          {getMainUniqueValues('modele').map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>

        {(mainFilterEquipmentFilters.designation || mainFilterEquipmentFilters.cmu || mainFilterEquipmentFilters.marque || mainFilterEquipmentFilters.modele) && (
          <button
            className="btn btn-danger"
            onClick={() => {
              setFilterEquipmentId(null);
              setMainFilterEquipmentFilters({ designation: '', cmu: '', marque: '', modele: '' });
            }}
          >
            ✕ Effacer filtres
          </button>
        )}
      </div>

      {filteredParts.length === 0 ? (
        <div className="empty-state">
          <p>Aucune pièce détachée enregistrée. Cliquez sur le bouton pour en ajouter une.</p>
        </div>
      ) : (
        <>
          <div className="spare-parts-table-container">
            <table className="spare-parts-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Désignation</th>
                  <th>Équipement</th>
                  <th>Coût Unitaire</th>
                  <th>Quantité</th>
                  <th>Fournisseur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map(part => {
                  const equipment = equipmentData.find(e => e.id === part.equipment_id);
                  return (
                    <tr key={part.id}>
                      <td className="part-reference">{part.reference}</td>
                      <td className="part-designation">{part.designation}</td>
                      <td className="part-equipment">
                        {equipment ? (
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                              {equipment.designation} ({equipment.cmu})
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                              {equipment.marque} {equipment.modele}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280' }}>Non lié</span>
                        )}
                      </td>
                      <td className="part-cost">{part.cost ? `${parseFloat(part.cost).toFixed(2)}€` : '-'}</td>
                      <td className="part-quantity">{part.quantity || 0}</td>
                      <td className="part-supplier">{part.supplier || '-'}</td>
                      <td className="actions">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditClick(part)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(part.id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="spare-parts-summary">
            <span>Coût total des pièces: <strong>{getTotalCost()}€</strong></span>
          </div>
        </>
      )}

      {/* Modal Ajouter/Modifier Pièce */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content spare-part-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPart ? '✏️ Modifier Pièce' : '➕ Ajouter Pièce'}</h2>
              <button className="modal-close" onClick={handleModalClose}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Référence *</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    placeholder="REF-001"
                  />
                </div>
                <div className="form-group">
                  <label>Désignation *</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Nom de la pièce"
                  />
                </div>
              </div>
              {/* Section de recherche d'équipement par filtres */}
              <div className="equipment-filter-section">
                <h3>🔍 Sélectionner l'Équipement par Caractéristique</h3>

                <div className="filter-criteria-grid">
                  <div className="filter-criterion">
                    <label>Désignation</label>
                    <select
                      value={equipmentFilters.designation}
                      onChange={(e) => handleFilterChange('designation', e.target.value)}
                    >
                      <option value="">-- Tous --</option>
                      {getUniqueValues('designation').map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-criterion">
                    <label>CMU</label>
                    <select
                      value={equipmentFilters.cmu}
                      onChange={(e) => handleFilterChange('cmu', e.target.value)}
                    >
                      <option value="">-- Tous --</option>
                      {getUniqueValues('cmu').map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-criterion">
                    <label>Marque</label>
                    <select
                      value={equipmentFilters.marque}
                      onChange={(e) => handleFilterChange('marque', e.target.value)}
                    >
                      <option value="">-- Tous --</option>
                      {getUniqueValues('marque').map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-criterion">
                    <label>Modèle</label>
                    <select
                      value={equipmentFilters.modele}
                      onChange={(e) => handleFilterChange('modele', e.target.value)}
                    >
                      <option value="">-- Tous --</option>
                      {getUniqueValues('modele').map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Liste des équipements correspondant aux filtres */}
                <div className="equipment-results">
                  {getFilteredEquipment().length > 0 ? (
                    getFilteredEquipment().map(eq => (
                      <div
                        key={eq.id}
                        className={`equipment-result-item ${formData.equipment_id === eq.id ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, equipment_id: eq.id }))}
                      >
                        <div className="equipment-result-item-main">
                          {eq.designation} ({eq.cmu})
                        </div>
                        <div className="equipment-result-item-secondary">
                          {eq.marque} {eq.modele} • Série: {eq.numeroSerie}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af' }}>
                      Aucun équipement ne correspond aux filtres sélectionnés
                    </div>
                  )}
                </div>
              </div>

              {/* Affichage détaillé de l'équipement sélectionné */}
              {selectedEquipmentInfo && (
                <div className="equipment-selected-info">
                  <h4>✅ Équipement Sélectionné</h4>
                  <div className="equipment-info-grid">
                    <div className="equipment-info-item">
                      <div className="equipment-info-label">Désignation</div>
                      <div className="equipment-info-value">{selectedEquipmentInfo.designation}</div>
                    </div>
                    <div className="equipment-info-item">
                      <div className="equipment-info-label">CMU</div>
                      <div className="equipment-info-value highlight">{selectedEquipmentInfo.cmu}</div>
                    </div>
                    <div className="equipment-info-item">
                      <div className="equipment-info-label">Marque</div>
                      <div className="equipment-info-value">{selectedEquipmentInfo.marque || '-'}</div>
                    </div>
                    <div className="equipment-info-item">
                      <div className="equipment-info-label">Modèle</div>
                      <div className="equipment-info-value">{selectedEquipmentInfo.modele || '-'}</div>
                    </div>
                    <div className="equipment-info-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="equipment-info-label">Numéro de Série</div>
                      <div className="equipment-info-value highlight">{selectedEquipmentInfo.numeroSerie || '-'}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Coût Unitaire (€)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Quantité</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Fournisseur</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notes additionnelles"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleFormSubmit}>
                {editingPart ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartsManagementPage;
