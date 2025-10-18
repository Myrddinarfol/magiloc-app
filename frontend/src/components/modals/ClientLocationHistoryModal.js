import React from 'react';
import './HistoryModals.css';

const ClientLocationHistoryModal = ({ clientName, history, onClose }) => {
  return (
    <div className="history-overlay">
      <div className="history-modal">
        {/* Header */}
        <div className="history-modal-header">
          <div className="history-modal-title">
            <span className="history-modal-icon">👤</span>
            <h2>Historique de Locations - {clientName}</h2>
            <span className="history-count">{history.length}</span>
          </div>
          <button onClick={onClose} className="history-close-btn">✕</button>
        </div>

        {/* Content */}
        <div className="history-modal-content">
          {history.length === 0 ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">📋</div>
              <p>Aucun historique de location pour ce client</p>
            </div>
          ) : (
            <div className="history-scroll-container">
              <table className="history-data-table">
                <thead>
                  <tr>
                    <th className="col-equipment">Équipement</th>
                    <th className="col-dates">Dates</th>
                    <th className="col-duration">Durée</th>
                    <th className="col-ca">CA HT</th>
                    <th className="col-offre">Offre</th>
                    <th className="col-notes">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((loc, index) => {
                    const hasCA = loc.ca_total_ht && loc.duree_jours_ouvres && loc.prix_ht_jour;
                    const caDetail = hasCA
                      ? `${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€/j${loc.remise_ld ? ' -20%' : ''}`
                      : '';

                    return (
                      <tr key={index} className="history-row">
                        <td className="col-equipment">
                          <div className="equipment-info">
                            <span className="equipment-name" title={loc.equipment_designation}>
                              {loc.equipment_designation || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="col-dates">
                          <div className="history-dates">
                            <span className="date-label">Début:</span>
                            <span className="date-value">{loc.date_debut ? new Date(loc.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</span>
                            <span className="date-label">Retour:</span>
                            <span className="date-value">{loc.date_retour_reel ? new Date(loc.date_retour_reel).toLocaleDateString('fr-FR') : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="col-duration">
                          {loc.duree_jours_ouvres ? (
                            <span className="history-duration-badge">{loc.duree_jours_ouvres} j</span>
                          ) : <span className="history-na">N/A</span>}
                        </td>
                        <td className="col-ca">
                          {hasCA ? (
                            <div className="history-ca-info">
                              <span className="ca-amount">{parseFloat(loc.ca_total_ht).toFixed(2)}€</span>
                              <span className="ca-detail">{caDetail}</span>
                            </div>
                          ) : <span className="history-na">N/A</span>}
                        </td>
                        <td className="col-offre">
                          <span className="history-offre">{loc.numero_offre || '-'}</span>
                        </td>
                        <td className="col-notes">
                          {loc.note_retour ? (
                            <span className="history-note-text" title={loc.note_retour}>
                              {loc.note_retour}
                            </span>
                          ) : <span className="history-na">-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="history-modal-footer">
          <button onClick={onClose} className="history-btn-close">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLocationHistoryModal;
