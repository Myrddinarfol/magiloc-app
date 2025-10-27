import React, { useState, useEffect } from 'react';
import locationHistoryService from '../../services/locationHistoryService';
import './MissingPricesModal.css';

const MissingPricesModal = ({ isOpen, onClose, onPricesUpdated }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMissingPrices();
    }
  }, [isOpen]);

  const loadMissingPrices = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await locationHistoryService.getMissingPrices();
      setLocations(data.locations || []);
    } catch (error) {
      setErrorMessage('Erreur lors du chargement des tarifs manquants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (location) => {
    setEditingId(location.id);
    setEditingPrice(location.current_price || '');
  };

  const handleSavePrice = async (locationId) => {
    if (!editingPrice || parseFloat(editingPrice) <= 0) {
      setErrorMessage('Veuillez entrer un prix valide');
      return;
    }

    try {
      setErrorMessage('');
      await locationHistoryService.updatePrice(locationId, editingPrice);
      setSuccessMessage(`✅ Tarif mis à jour avec succès`);

      // Recharger la liste
      setTimeout(() => {
        setSuccessMessage('');
        setEditingId(null);
        loadMissingPrices();
        if (onPricesUpdated) onPricesUpdated();
      }, 1000);
    } catch (error) {
      setErrorMessage('Erreur lors de la mise à jour du tarif');
      console.error(error);
    }
  };

  const handleAutoFill = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const result = await locationHistoryService.autoFillPrices();
      setSuccessMessage(`✅ ${result.updatedCount} tarifs mis à jour automatiquement`);

      setTimeout(() => {
        setSuccessMessage('');
        loadMissingPrices();
        if (onPricesUpdated) onPricesUpdated();
      }, 2000);
    } catch (error) {
      setErrorMessage('Erreur lors du remplissage automatique');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="missing-prices-overlay">
      <div className="missing-prices-modal">
        {/* Header */}
        <div className="missing-prices-header">
          <h2 className="missing-prices-title">
            <span className="missing-prices-icon">💰</span>
            Tarifs Manquants - Historique Locations
          </h2>
          <button onClick={onClose} className="missing-prices-close-btn">✕</button>
        </div>

        {/* Content */}
        <div className="missing-prices-content">
          {errorMessage && (
            <div className="error-banner">
              <span className="error-icon">❌</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="success-banner">
              <span className="success-icon">✅</span>
              <p>{successMessage}</p>
            </div>
          )}

          {loading ? (
            <div className="loading-state">Chargement des données...</div>
          ) : locations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>Tous les tarifs sont à jour !</p>
            </div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="missing-prices-actions">
                <button
                  className="btn-auto-fill"
                  onClick={handleAutoFill}
                  disabled={loading}
                >
                  🤖 Remplir automatiquement ({locations.filter(l => l.can_auto_fill).length})
                </button>
                <p className="info-text">
                  {locations.length} location(s) sans tarif trouvée(s)
                </p>
              </div>

              {/* Table */}
              <div className="missing-prices-table-wrapper">
                <table className="missing-prices-table">
                  <thead>
                    <tr>
                      <th className="col-equipment">Équipement</th>
                      <th className="col-client">Client</th>
                      <th className="col-dates">Période</th>
                      <th className="col-days">Jours</th>
                      <th className="col-current-price">Tarif Actuel</th>
                      <th className="col-stored-price">Tarif Historique</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((location) => (
                      <tr key={location.id} className="missing-prices-row">
                        <td className="col-equipment">
                          <div className="equipment-info">
                            <div className="equipment-name">
                              {location.equipment_designation}
                            </div>
                            {(location.cmu || location.marque) && (
                              <div className="equipment-specs">
                                {location.cmu && <span>{location.cmu}</span>}
                                {location.marque && <span>{location.marque}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="col-client">{location.client}</td>
                        <td className="col-dates">
                          <div className="dates-range">
                            <span>
                              {new Date(location.date_debut).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="separator">→</span>
                            <span>
                              {new Date(location.date_retour_reel || location.date_fin_theorique).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </td>
                        <td className="col-days">
                          <span className="days-badge">{location.duree_jours_ouvres}j</span>
                        </td>
                        <td className="col-current-price">
                          <span className="current-price">
                            {location.current_price ? `${parseFloat(location.current_price).toFixed(2)}€/j` : '-'}
                          </span>
                        </td>
                        <td className="col-stored-price">
                          {editingId === location.id ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="price-input"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <span className="missing-price">-</span>
                          )}
                        </td>
                        <td className="col-actions">
                          {editingId === location.id ? (
                            <div className="action-buttons">
                              <button
                                className="btn-save"
                                onClick={() => handleSavePrice(location.id)}
                                disabled={loading}
                              >
                                💾 Sauver
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingPrice('');
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button
                                className={`btn-edit ${!location.can_auto_fill ? 'disabled' : ''}`}
                                onClick={() => handleEditPrice(location)}
                                title={!location.can_auto_fill ? 'Aucun tarif actuel disponible' : 'Utiliser le tarif actuel'}
                                disabled={!location.can_auto_fill || loading}
                              >
                                📝 Modifier
                              </button>
                              <button
                                className="btn-auto"
                                onClick={() => {
                                  if (location.can_auto_fill) {
                                    handleSavePrice(location.id, location.current_price);
                                  }
                                }}
                                disabled={!location.can_auto_fill || loading}
                                title="Remplir avec le tarif actuel"
                              >
                                🤖 Auto
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="missing-prices-footer">
          <button onClick={onClose} className="btn-close">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissingPricesModal;
