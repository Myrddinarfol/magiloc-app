import React from 'react';
import './CADetailsModal.css';

const CADetailsModal = ({
  isOpen,
  onClose,
  caType, // 'estimated' ou 'confirmed'
  month,
  year,
  closedLocations = [],
  ongoingLocations = [],
  summary = {}
}) => {
  if (!isOpen) return null;

  // Déterminer les locations à afficher selon le type
  const getLocationsToDisplay = () => {
    if (caType === 'confirmed') {
      // Pour CA Confirmé : locations fermées + jours confirmés des locations en cours
      const closedWithCA = closedLocations.map(loc => ({
        ...loc,
        caDisplay: loc.caThisMonth,
        statusBadge: 'Fermée'
      }));

      const ongoingConfirmed = ongoingLocations.map(loc => ({
        ...loc,
        caDisplay: loc.caConfirmedThisMonth,
        statusBadge: 'En cours',
        daysDisplay: `${loc.businessDaysConfirmedThisMonth} j confirmés`
      }));

      return [...closedWithCA, ...ongoingConfirmed];
    } else {
      // Pour CA Estimatif : locations fermées + jours totaux des locations en cours
      const closedWithCA = closedLocations.map(loc => ({
        ...loc,
        caDisplay: loc.caThisMonth,
        statusBadge: 'Fermée'
      }));

      const ongoingEstimated = ongoingLocations.map(loc => ({
        ...loc,
        caDisplay: loc.caEstimatedThisMonth,
        statusBadge: 'En cours',
        daysDisplay: `${loc.businessDaysThisMonth} j prévus (${loc.businessDaysConfirmedThisMonth} confirmés + ${loc.businessDaysEstimatedRemaining} estimés)`
      }));

      return [...closedWithCA, ...ongoingEstimated];
    }
  };

  const locations = getLocationsToDisplay();
  const totalCA = caType === 'confirmed' ? summary.totalCAConfirmed : summary.totalCAEstimated;

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

  const getStatusColor = (status) => {
    if (status === 'Fermée') return '#6b7280'; // Gris
    if (status === 'En cours') return '#10b981'; // Vert
    return '#9ca3af';
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
                <div className="summary-card">
                  <span className="summary-label">Locations Fermées</span>
                  <span className="summary-value">{summary.closedCount || 0}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Locations En Cours</span>
                  <span className="summary-value">{summary.ongoingCount || 0}</span>
                </div>
              </div>

              {/* Table */}
              <div className="ca-details-table-wrapper">
                <table className="ca-details-table">
                  <thead>
                    <tr>
                      <th className="col-status">Statut</th>
                      <th className="col-client">Client</th>
                      <th className="col-equipment">Équipement</th>
                      <th className="col-dates">Période Location</th>
                      <th className="col-days">Jours {caType === 'confirmed' ? 'Confirmés' : 'Totaux'}</th>
                      <th className="col-rate">Tarif/j</th>
                      <th className="col-discount">Réduction</th>
                      <th className="col-ca">CA {caType === 'confirmed' ? 'Confirmé' : 'Estimatif'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((loc, index) => {
                      const startDateObj = new Date(loc.startDate);
                      const endDateObj = new Date(loc.endDate || loc.endDateTheoretical);
                      const startDate = startDateObj.toLocaleDateString('fr-FR');
                      const endDate = endDateObj.toLocaleDateString('fr-FR');

                      // Déterminer le nombre de jours à afficher selon le type
                      const daysToDisplay = loc.statusBadge === 'Fermée'
                        ? loc.businessDaysThisMonth
                        : (caType === 'confirmed' ? loc.businessDaysConfirmedThisMonth : loc.businessDaysThisMonth);

                      return (
                        <tr key={index} className={`ca-details-row status-${loc.statusBadge.toLowerCase()}`}>
                          <td className="col-status">
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(loc.statusBadge) + '20', color: getStatusColor(loc.statusBadge) }}
                            >
                              {loc.statusBadge}
                            </span>
                          </td>
                          <td className="col-client">
                            <span title={loc.client}>{loc.client || 'N/A'}</span>
                          </td>
                          <td className="col-equipment">
                            <span title={loc.designation}>{loc.designation || 'N/A'}</span>
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
                            <span className="days-badge">
                              {daysToDisplay} j
                              {loc.statusBadge === 'En cours' && caType === 'estimated' && (
                                <span className="days-breakdown">
                                  ({loc.businessDaysConfirmedThisMonth}c + {loc.businessDaysEstimatedRemaining}e)
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="col-rate">
                            {loc.dailyRate ? (
                              <span>{parseFloat(loc.dailyRate).toFixed(2)}€</span>
                            ) : (
                              <span className="missing-price">-</span>
                            )}
                          </td>
                          <td className="col-discount">
                            <span className={`discount-badge ${loc.discount20Applied ? 'applied' : ''}`}>
                              {loc.discount20Applied ? '-20%' : 'Aucune'}
                            </span>
                          </td>
                          <td className="col-ca">
                            <span className="ca-amount">
                              {parseFloat(loc.caDisplay).toFixed(2)}€
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Détail calcul */}
              <div className="ca-details-calculation">
                <h4>Méthode de calcul</h4>
                <p>
                  Pour chaque location : <strong>Jours ouvrés du mois × Tarif/jour</strong>
                  {(ongoingLocations.some(l => l.discount20Applied) || closedLocations.some(l => l.discount20Applied)) && (
                    <span> − Réduction 20% (si location ≥ 21 jours)</span>
                  )}
                </p>
                {caType === 'estimated' && ongoingLocations.length > 0 && (
                  <p className="estimation-note">
                    ⓘ Pour les locations en cours, les jours restants du mois sont estimés jusqu'à la date prévue de fin.
                    Le CA estimatif comprend les jours confirmés + les jours estimés.
                  </p>
                )}
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
