import React from 'react';
import './CADetailsModal.css';

const CADetailsModal = ({
  isOpen,
  onClose,
  caType, // 'estimated' ou 'confirmed'
  month,
  year,
  historicalLocations = [],
  activeLocations = [],
  stats = {}
}) => {
  if (!isOpen) return null;

  // Récupérer les locations appropriées selon le type
  const locations = caType === 'confirmed'
    ? historicalLocations
    : [...historicalLocations, ...activeLocations];

  const totalCA = caType === 'confirmed'
    ? (stats.historicalCA || 0)
    : (stats.estimatedCA || 0);

  const getMonthYearDisplay = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${months[month]} ${year}`;
  };

  const getCATypeLabel = () => {
    return caType === 'confirmed' ? 'CA Confirmé' : 'CA Estimatif';
  };

  const getCATypeColor = () => {
    return caType === 'confirmed' ? '#16a34a' : '#3b82f6';
  };

  return (
    <div className="ca-details-overlay">
      <div className="ca-details-modal">
        {/* Header */}
        <div className="ca-details-header">
          <div className="ca-details-title-wrapper">
            <h2 className="ca-details-title">
              <span className="ca-details-icon">💰</span>
              Détails {getCATypeLabel()}
            </h2>
            <p className="ca-details-subtitle">{getMonthYearDisplay()}</p>
          </div>
          <button onClick={onClose} className="ca-details-close-btn">✕</button>
        </div>

        {/* Content */}
        <div className="ca-details-content">
          {locations.length === 0 ? (
            <div className="ca-details-empty">
              <div className="ca-details-empty-icon">📭</div>
              <p>Aucune location pour cette période</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="ca-details-summary">
                <div className="summary-card">
                  <span className="summary-label">{getCATypeLabel()}</span>
                  <span className="summary-value" style={{ color: getCATypeColor() }}>
                    {parseFloat(totalCA).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Locations</span>
                  <span className="summary-value">{locations.length}</span>
                </div>
              </div>

              {/* Table */}
              <div className="ca-details-table-wrapper">
                <table className="ca-details-table">
                  <thead>
                    <tr>
                      <th className="col-client">Client</th>
                      <th className="col-equipment">Équipement</th>
                      <th className="col-dates">Dates</th>
                      <th className="col-days">Jours</th>
                      <th className="col-rate">Tarif/j</th>
                      <th className="col-discount">Réduction</th>
                      <th className="col-ca">CA HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((loc, index) => {
                      const hasCA = loc.ca_total_ht && loc.duree_jours_ouvres && loc.prix_ht_jour;
                      const startDate = new Date(loc.date_debut).toLocaleDateString('fr-FR');
                      const endDate = new Date(loc.date_retour_reel || loc.date_fin_theorique).toLocaleDateString('fr-FR');
                      const discountLabel = loc.remise_ld ? '-20%' : 'Aucune';
                      const isActive = !loc.date_retour_reel;

                      return (
                        <tr key={index} className={`ca-details-row ${isActive ? 'active-location' : ''}`}>
                          <td className="col-client">
                            <span title={loc.client}>{loc.client || 'N/A'}</span>
                          </td>
                          <td className="col-equipment">
                            <span title={loc.equipment_designation}>{loc.equipment_designation || 'N/A'}</span>
                          </td>
                          <td className="col-dates">
                            <div className="dates-range">
                              <span className="date-label">Du:</span>
                              <span>{startDate}</span>
                              <span className="date-label">Au:</span>
                              <span>{endDate}</span>
                            </div>
                          </td>
                          <td className="col-days">
                            <span className="days-badge">{loc.duree_jours_ouvres || 0} j</span>
                          </td>
                          <td className="col-rate">
                            {loc.prix_ht_jour ? (
                              <span>{parseFloat(loc.prix_ht_jour).toFixed(2)}€</span>
                            ) : (
                              <span className="missing-price">-</span>
                            )}
                          </td>
                          <td className="col-discount">
                            <span className={`discount-badge ${loc.remise_ld ? 'applied' : ''}`}>
                              {discountLabel}
                            </span>
                          </td>
                          <td className="col-ca">
                            {hasCA ? (
                              <span className="ca-amount">
                                {parseFloat(loc.ca_total_ht).toFixed(2)}€
                              </span>
                            ) : (
                              <span className="missing-ca">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer with total */}
              <div className="ca-details-footer">
                <div className="footer-info">
                  <span className="footer-label">Total {getCATypeLabel()}:</span>
                  <span className="footer-total" style={{ color: getCATypeColor() }}>
                    {parseFloat(totalCA).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Close Button */}
        <div className="ca-details-modal-footer">
          <button onClick={onClose} className="ca-details-btn-close">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CADetailsModal;
