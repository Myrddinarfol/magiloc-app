import React from 'react';
import './HistoryModals.css';

const LocationHistoryModal = ({ history, onClose }) => {
  return (
    <div className="history-overlay">
      <div className="history-modal location-history-modal">
        {/* Header */}
        <div className="history-modal-header">
          <div className="history-modal-title">
            <span className="history-modal-icon">📜</span>
            <h2>Historique des Locations</h2>
            <span className="history-count">{history.length}</span>
          </div>
          <button onClick={onClose} className="history-close-btn">✕</button>
        </div>

        {/* Content */}
        <div className="history-modal-content">
          {history.length === 0 ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">📋</div>
              <p>Aucun historique de location pour cet équipement</p>
            </div>
          ) : (
            <div className="history-scroll-container">
              <table className="history-data-table location-history-table">
                <thead>
                  <tr>
                    <th className="col-client">Client</th>
                    <th className="col-dates">Dates</th>
                    <th className="col-duration">Durée</th>
                    <th className="col-tarif">Tarif/j</th>
                    <th className="col-ca">CA HT</th>
                    <th className="col-options">Options</th>
                    <th className="col-offre">Offre</th>
                    <th className="col-notes">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((loc, index) => {
                    const isLoan = loc.est_pret === true || loc.est_pret === 1;
                    const isLongDuration = loc.remise_ld === true || loc.remise_ld === 1;
                    const hasMinimumBilling = loc.minimum_facturation_apply === true || loc.minimum_facturation_apply === 1;

                    // Vérifier s'il y a un CA ET que ce n'est pas un prêt
                    const hasCA = loc.ca_total_ht && loc.duree_jours_ouvres && loc.prix_ht_jour && !isLoan;

                    let caDetail = '';
                    if (hasCA && !isLoan) {
                      caDetail = `${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€/j${isLongDuration ? ' -20%' : ''}`;
                      if (hasMinimumBilling) {
                        caDetail += ` (Min: ${loc.minimum_facturation}€)`;
                      }
                    }

                    return (
                      <tr key={index} className="history-row">
                        <td className="col-client">
                          <span className="history-client-badge">{loc.client || 'N/A'}</span>
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
                          {loc.duree_jours_ouvres && !isLoan ? (
                            <span className="history-duration-badge">{loc.duree_jours_ouvres} j</span>
                          ) : isLoan ? (
                            <span className="history-na">-</span>
                          ) : (
                            <span className="history-na">N/A</span>
                          )}
                        </td>
                        <td className="col-tarif">
                          {loc.prix_ht_jour && !isLoan ? (
                            <span className="history-tarif">{loc.prix_ht_jour}€/j</span>
                          ) : (
                            <span className="history-na">-</span>
                          )}
                        </td>
                        <td className="col-ca">
                          {isLoan ? (
                            <span className="history-loan-badge" title="Matériel en prêt (non facturé)">
                              🎁 Prêt
                            </span>
                          ) : hasCA ? (
                            <div className="history-ca-info">
                              <span className="ca-amount">
                                {parseFloat(loc.ca_total_ht).toFixed(2)}€
                                {hasMinimumBilling && (
                                  <span style={{ marginLeft: '4px', color: '#fbbf24', fontWeight: 'bold' }} title="Minimum de facturation appliqué">
                                    💰
                                  </span>
                                )}
                              </span>
                              <span className="ca-detail">{caDetail}</span>
                            </div>
                          ) : (
                            <span className="history-na">N/A</span>
                          )}
                        </td>
                        <td className="col-options">
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {isLoan && (
                              <span style={{
                                background: 'rgba(168, 85, 247, 0.2)',
                                color: '#a855f7',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                whiteSpace: 'nowrap'
                              }} title="Matériel en prêt">
                                🎁 Prêt
                              </span>
                            )}
                            {isLongDuration && !isLoan && (
                              <span style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#14b8a6',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                whiteSpace: 'nowrap'
                              }} title="Longue durée (-20%)">
                                📊 -20%
                              </span>
                            )}
                            {hasMinimumBilling && !isLoan && (
                              <span style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#3b82f6',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                whiteSpace: 'nowrap'
                              }} title="Minimum de facturation appliqué">
                                💵 Min
                              </span>
                            )}
                            {!isLoan && !isLongDuration && !hasMinimumBilling && (
                              <span className="history-na">-</span>
                            )}
                          </div>
                        </td>
                        <td className="col-offre">
                          <span className="history-offre">{loc.numero_offre || '-'}</span>
                        </td>
                        <td className="col-notes">
                          {loc.notes_location ? (
                            <span className="history-note-text" title={loc.notes_location}>
                              📝 {loc.notes_location}
                            </span>
                          ) : loc.note_retour ? (
                            <span className="history-note-text" title={loc.note_retour}>
                              🔙 {loc.note_retour}
                            </span>
                          ) : (
                            <span className="history-na">-</span>
                          )}
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
          <div className="history-legend">
            <span style={{ fontSize: '12px', color: '#d1d5db' }}>
              <span style={{ marginRight: '16px' }}>🎁 = Prêt (non facturé)</span>
              <span style={{ marginRight: '16px' }}>📊 = Longue durée (-20%)</span>
              <span>💵 = Minimum facturation</span>
            </span>
          </div>
          <button onClick={onClose} className="history-btn-close">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationHistoryModal;
