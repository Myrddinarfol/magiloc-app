import React from 'react';
import './HistoryModals.css';

const ClientLocationHistoryModal = ({ clientName, history, onClose }) => {
  // Fonction pour calculer le CA d'une location
  const calculateLocationCA = (loc) => {
    // Si c'est un prêt, CA = 0
    const isLoan = loc.est_pret === true || loc.est_pret === 1;
    if (isLoan) {
      return 0;
    }

    // Si ca_total_ht existe déjà, l'utiliser
    if (loc.ca_total_ht) {
      return parseFloat(loc.ca_total_ht);
    }

    // Sinon, calculer à partir de duree et tarif
    if (loc.duree_jours_ouvres && loc.prix_ht_jour) {
      const duree = parseFloat(loc.duree_jours_ouvres);
      const tarif = parseFloat(loc.prix_ht_jour);
      let ca = duree * tarif;

      // Appliquer la remise long durée si applicable
      if (loc.remise_ld) {
        ca = ca * 0.8; // -20%
      }

      return ca;
    }

    return null;
  };

  // Calculer le CA total pour ce client (sans les prêts)
  const totalCA = history.reduce((sum, loc) => {
    const ca = calculateLocationCA(loc);
    return sum + (ca || 0);
  }, 0);

  // Compter les locations et les prêts
  const loanCount = history.filter(loc => loc.est_pret === true || loc.est_pret === 1).length;
  const locationCount = history.length - loanCount;

  return (
    <div className="history-overlay">
      <div className="history-modal location-history-modal">
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
              <table className="history-data-table location-history-table">
                <thead>
                  <tr>
                    <th className="col-equipment">Équipement</th>
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
                    const calculatedCA = calculateLocationCA(loc);
                    const hasCA = calculatedCA !== null && calculatedCA !== undefined && !isLoan;
                    const caDetail = hasCA && loc.duree_jours_ouvres && loc.prix_ht_jour
                      ? `${loc.duree_jours_ouvres}j × ${parseFloat(loc.prix_ht_jour).toFixed(2)}€/j${isLongDuration ? ' -20%' : ''}`
                      : '';

                    return (
                      <tr key={index} className="history-row">
                        <td className="col-equipment">
                          <div className="equipment-info">
                            <div className="equipment-details-wrapper">
                              <span className="equipment-name" title={loc.equipment_designation}>
                                {loc.equipment_designation || 'N/A'}
                              </span>
                              {loc.cmu || loc.numero_serie || loc.longueur ? (
                                <div className="equipment-extra-details">
                                  {loc.cmu && <span className="detail-item"><strong>CMU:</strong> {loc.cmu}</span>}
                                  {loc.longueur && <span className="detail-item"><strong>Longueur:</strong> {loc.longueur}</span>}
                                  {loc.numero_serie && <span className="detail-item"><strong>N° Série:</strong> {loc.numero_serie}</span>}
                                </div>
                              ) : null}
                            </div>
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
                            <span className="history-tarif">{parseFloat(loc.prix_ht_jour).toFixed(2)}€/j</span>
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
                                {calculatedCA.toFixed(2)}€
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
                                color: '#10b981',
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
              <span style={{ marginRight: '16px' }}>📊 {locationCount} location{locationCount > 1 ? 's' : ''}</span>
              <span style={{ marginRight: '16px' }}>🎁 {loanCount} prêt{loanCount > 1 ? 's' : ''}</span>
              <span style={{ marginRight: '16px' }}>💰 CA Total: <strong style={{ color: '#fbbf24' }}>{totalCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong></span>
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

export default ClientLocationHistoryModal;
