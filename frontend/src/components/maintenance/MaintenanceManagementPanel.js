import React, { useState, useMemo } from 'react';
import { useSpareParts } from '../../hooks/useSpareParts';
import './MaintenanceManagementPanel.css';

const MaintenanceManagementPanel = ({
  equipment,
  onValidateMaintenance,
  maintenanceData = {}
}) => {
  const { spareParts } = useSpareParts();
  const [activeTab, setActiveTab] = useState('notes'); // notes, pieces, temps

  // État de la maintenance
  const [maintenance, setMaintenance] = useState({
    notes_maintenance: maintenanceData.notes_maintenance || '',
    main_oeuvre_heures: maintenanceData.main_oeuvre_heures || '',
    motif_maintenance: maintenanceData.motif_maintenance || '',
    pieces_utilisees: maintenanceData.pieces_utilisees || [],
    vgp_effectuee: maintenanceData.vgp_effectuee || false,
    ...maintenanceData
  });

  // Pièces détachées liées à cet équipement
  const equipmentSpareParts = useMemo(() => {
    return spareParts.filter(p => p.equipment_id === equipment.id);
  }, [spareParts, equipment.id]);

  // Ajouter une pièce utilisée
  const handleAddSparePartUsed = () => {
    setMaintenance(prev => ({
      ...prev,
      pieces_utilisees: [
        ...prev.pieces_utilisees,
        {
          id: Date.now(),
          designation: '',
          quantite: 1,
          spare_part_id: null,
          is_manual: true
        }
      ]
    }));
  };

  // Mettre à jour une pièce utilisée
  const handleUpdateSparePart = (id, field, value) => {
    setMaintenance(prev => ({
      ...prev,
      pieces_utilisees: prev.pieces_utilisees.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  // Supprimer une pièce utilisée
  const handleRemoveSparePart = (id) => {
    setMaintenance(prev => ({
      ...prev,
      pieces_utilisees: prev.pieces_utilisees.filter(p => p.id !== id)
    }));
  };

  return (
    <div className="maintenance-management-panel">
      {/* MOTIF ET NOTES DE RETOUR - En haut côte à côte */}
      <div className="maintenance-top-section">
        <div className="motif-section">
          <h4>🔴 MOTIF DE MAINTENANCE</h4>
          <textarea
            value={maintenance.motif_maintenance}
            onChange={(e) => setMaintenance(prev => ({ ...prev, motif_maintenance: e.target.value }))}
            placeholder="Motif de l'entrée en maintenance..."
            rows="3"
            className="maintenance-textarea"
          />
        </div>

        <div className="notes-retour-section">
          <h4>📝 NOTES DE RETOUR</h4>
          <textarea
            value={maintenance.note_retour || ''}
            onChange={(e) => setMaintenance(prev => ({ ...prev, note_retour: e.target.value }))}
            placeholder="Notes de retour du client..."
            rows="3"
            className="maintenance-textarea"
          />
        </div>
      </div>

      {/* PANNEAU PRINCIPAL DE MAINTENANCE */}
      <div className="maintenance-main-panel">
        <div className="maintenance-tabs">
          <button
            className={`maintenance-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            📝 NOTES DE MAINTENANCE
          </button>
          <button
            className={`maintenance-tab ${activeTab === 'pieces' ? 'active' : ''}`}
            onClick={() => setActiveTab('pieces')}
          >
            🔧 PIÈCES DÉTACHÉES
          </button>
          <button
            className={`maintenance-tab ${activeTab === 'temps' ? 'active' : ''}`}
            onClick={() => setActiveTab('temps')}
          >
            ⏱️ TEMPS MAIN D'ŒUVRE
          </button>
        </div>

        <div className="maintenance-content">
          {/* TAB: NOTES DE MAINTENANCE */}
          {activeTab === 'notes' && (
            <div className="maintenance-notes-tab">
              <textarea
                value={maintenance.notes_maintenance}
                onChange={(e) => setMaintenance(prev => ({ ...prev, notes_maintenance: e.target.value }))}
                placeholder="Détaillez le travail effectué, les observations, le processus suivi, etc..."
                rows="12"
                className="maintenance-notes-textarea"
              />
            </div>
          )}

          {/* TAB: PIÈCES DÉTACHÉES */}
          {activeTab === 'pieces' && (
            <div className="maintenance-pieces-tab">
              <div className="pieces-list">
                {maintenance.pieces_utilisees.length > 0 ? (
                  maintenance.pieces_utilisees.map((piece, idx) => (
                    <div key={piece.id} className="piece-item">
                      <div className="piece-row">
                        <select
                          value={piece.spare_part_id || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'manual') {
                              handleUpdateSparePart(piece.id, 'is_manual', true);
                            } else {
                              handleUpdateSparePart(piece.id, 'spare_part_id', value ? parseInt(value) : null);
                              handleUpdateSparePart(piece.id, 'is_manual', false);
                            }
                          }}
                          className="piece-select"
                        >
                          <option value="">-- Sélectionner une pièce --</option>
                          {equipmentSpareParts.map(sp => (
                            <option key={sp.id} value={sp.id}>
                              {sp.designation} (Ref: {sp.reference})
                            </option>
                          ))}
                          <option value="manual">✏️ Saisir manuellement</option>
                        </select>

                        {piece.is_manual && (
                          <input
                            type="text"
                            value={piece.designation}
                            onChange={(e) => handleUpdateSparePart(piece.id, 'designation', e.target.value)}
                            placeholder="Désignation de la pièce..."
                            className="piece-designation"
                          />
                        )}

                        <input
                          type="number"
                          value={piece.quantite}
                          onChange={(e) => handleUpdateSparePart(piece.id, 'quantite', parseInt(e.target.value) || 1)}
                          min="1"
                          className="piece-quantity"
                          placeholder="Qté"
                        />

                        <button
                          onClick={() => handleRemoveSparePart(piece.id)}
                          className="btn btn-sm btn-danger"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-pieces">Aucune pièce ajoutée pour le moment</p>
                )}
              </div>

              <button
                onClick={handleAddSparePartUsed}
                className="btn btn-primary"
                style={{ marginTop: '15px' }}
              >
                ➕ Ajouter une pièce
              </button>
            </div>
          )}

          {/* TAB: TEMPS MAIN D'ŒUVRE */}
          {activeTab === 'temps' && (
            <div className="maintenance-temps-tab">
              <div className="temps-input-group">
                <label>Temps de main d'œuvre (en heures)</label>
                <input
                  type="number"
                  value={maintenance.main_oeuvre_heures}
                  onChange={(e) => setMaintenance(prev => ({ ...prev, main_oeuvre_heures: e.target.value }))}
                  placeholder="0.00"
                  step="0.25"
                  min="0"
                  className="temps-input"
                />
                <span className="temps-unit">heures</span>
              </div>

              {maintenance.main_oeuvre_heures && (
                <div className="temps-summary">
                  <p>Temps saisi: <strong>{maintenance.main_oeuvre_heures}h</strong></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AIDE A LA MAINTENANCE */}
      <div className="maintenance-aide-section">
        <h4>💡 AIDE A LA MAINTENANCE</h4>
        <div className="aide-tabs">
          <div className="aide-tab">
            <h5>📝 Tips & Conseils</h5>
            <p>{equipment.maintenanceHelpers?.tips_conseils || 'Aucun conseil enregistré'}</p>
          </div>
          <div className="aide-tab">
            <h5>🔗 Liens Utiles</h5>
            <p>{equipment.maintenanceHelpers?.liens_utiles || 'Aucun lien enregistré'}</p>
          </div>
          <div className="aide-tab">
            <h5>⚠️ Pièces Critiques</h5>
            <p>{equipment.maintenanceHelpers?.pieces_critiques || 'Aucune pièce critique enregistrée'}</p>
          </div>
          <div className="aide-tab">
            <h5>📞 Contact Constructeur</h5>
            <p>{equipment.maintenanceHelpers?.contact_constructeur_nom || 'Non disponible'}</p>
          </div>
          <div className="aide-tab">
            <h5>🔴 Historique Problèmes</h5>
            <p>{equipment.maintenanceHelpers?.historique_problemes || 'Aucun problème récurrent'}</p>
          </div>
        </div>
      </div>

      {/* VGP + BOUTON VALIDER */}
      <div className="maintenance-bottom-section">
        <div className="vgp-section">
          <h4>📅 VGP</h4>
          <div className="vgp-info">
            <span>Prochain VGP: <strong>{equipment.prochainVGP || 'N/A'}</strong></span>
            <label className="vgp-checkbox">
              <input
                type="checkbox"
                checked={maintenance.vgp_effectuee}
                onChange={(e) => setMaintenance(prev => ({ ...prev, vgp_effectuee: e.target.checked }))}
              />
              VGP effectuée pendant cette maintenance
            </label>
          </div>
        </div>

        <button
          className="btn btn-success btn-validate-maintenance"
          onClick={() => onValidateMaintenance(maintenance)}
        >
          ✅ VALIDER LA MAINTENANCE
        </button>
      </div>
    </div>
  );
};

export default MaintenanceManagementPanel;
