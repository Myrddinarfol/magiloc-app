import React, { useEffect, useState } from 'react';
import { useSpareParts } from '../hooks/useSpareParts';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';
import '../pages/SparePartsManagementPage.css';

const SparePartsManagementPage = () => {
  const { spareParts, isLoading, loadSpareParts, addSparePart, updateSparePart, deleteSparePart } = useSpareParts();
  const { equipmentData } = useEquipment();
  const { showToast } = useUI();
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [filterEquipmentId, setFilterEquipmentId] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'equipment_id' ? (value ? parseInt(value) : null) :
              name === 'quantity' || name === 'cost' ? parseFloat(value) || '' : value
    }));
  };

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
    setShowModal(true);
  };

  const handleEditClick = (part) => {
    setEditingPart(part);
    setFormData(part);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPart(null);
  };

  const handleFormSubmit = async () => {
    if (!formData.reference.trim() || !formData.designation.trim()) {
      showToast('Référence et désignation requises', 'error');
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
        title="🔧 Gestion des Pièces Détachées"
        subtitle={`${filteredParts.length} pièce${filteredParts.length !== 1 ? 's' : ''}`}
      />

      <div className="spare-parts-controls">
        <div className="filter-group">
          <label>Filtrer par équipement:</label>
          <select
            value={filterEquipmentId || ''}
            onChange={(e) => setFilterEquipmentId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Toutes les pièces</option>
            {equipmentData.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.designation} ({eq.cmu})
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          ➕ Ajouter une Pièce
        </button>
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
                      <td className="part-equipment">{equipment ? `${equipment.designation} (${equipment.cmu})` : 'Non lié'}</td>
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
              <div className="form-group">
                <label>Équipement</label>
                <select
                  name="equipment_id"
                  value={formData.equipment_id || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Non lié à un équipement</option>
                  {equipmentData.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.designation} ({eq.cmu})
                    </option>
                  ))}
                </select>
              </div>
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
