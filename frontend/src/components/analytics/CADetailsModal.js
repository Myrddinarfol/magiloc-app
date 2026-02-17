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
  loanLocations = [],
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
                      // Si location EN COURS avec dépassement, afficher date effective au lieu de théorique
                      const endDateToUse = loc.endDateEffective || loc.endDate || loc.endDateTheoretical;
                      const endDateObj = new Date(endDateToUse);
                      const startDate = startDateObj.toLocaleDateString('fr-FR');
                      const endDate = endDateObj.toLocaleDateString('fr-FR');

                      // Vérifier s'il y a dépassement ou pas de date fin
                      const hasOverdue = loc.endDateTheoretical && loc.endDateEffective && loc.endDateEffective > loc.endDateTheoretical;
                      const hasNoEndDate = loc.hasNoEndDate;

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
                            <div className="equipment-info-detail">
                              <div className="equipment-name" title={loc.designation}>{loc.designation || 'N/A'}</div>
                              {(loc.cmu || loc.modele || loc.marque) && (
                                <div className="equipment-specs">
                                  {loc.cmu && <span className="spec-item">CMU: {loc.cmu}</span>}
                                  {loc.modele && <span className="spec-item">Modèle: {loc.modele}</span>}
                                  {loc.marque && <span className="spec-item">Marque: {loc.marque}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="col-dates">
                            <div className="dates-range">
                              <span className="date-label">Du:</span>
                              <span>{startDate}</span>
                              <span className="date-label">Au:</span>
                              <span>
                                {hasNoEndDate ? <em>Indéfinie</em> : endDate}
                                {hasOverdue && (
                                  <span style={{ marginLeft: '4px', color: '#ef4444', fontWeight: 'bold' }} title="Dépassement: location non retournée">
                                    ⚠️ +
                                  </span>
                                )}
                                {hasNoEndDate && (
                                  <span style={{ marginLeft: '4px', color: '#f59e0b', fontWeight: 'bold' }} title="Pas de date fin théorique">
                                    ∞
                                  </span>
                                )}
                              </span>
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

              {/* Section Matériels en Prêt */}
              {loanLocations && loanLocations.length > 0 && (
                <div className="ca-details-loans-section">
                  <h4 className="loans-title">🎁 Matériels en Prêt (Non Facturés)</h4>
                  <div className="ca-details-table-wrapper">
                    <table className="ca-details-table loans-table">
                      <thead>
                        <tr>
                          <th className="col-equipment">Équipement</th>
                          <th className="col-client">Client</th>
                          <th className="col-dates">Période Location</th>
                          <th className="col-days">Jours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loanLocations.map((loan, index) => {
                          const startDateObj = new Date(loan.startDate);
                          const endDateObj = loan.endDate ? new Date(loan.endDate) : new Date();
                          const startDate = startDateObj.toLocaleDateString('fr-FR');
                          const endDate = loan.endDate ? endDateObj.toLocaleDateString('fr-FR') : '∞';

                          return (
                            <tr key={index} className="ca-details-row status-loan">
                              <td className="col-equipment">
                                <div className="equipment-info-detail">
                                  <div className="equipment-name" title={loan.designation}>{loan.designation || 'N/A'}</div>
                                  {(loan.cmu || loan.modele || loan.marque) && (
                                    <div className="equipment-specs">
                                      {loan.cmu && <span className="spec-item">CMU: {loan.cmu}</span>}
                                      {loan.modele && <span className="spec-item">Modèle: {loan.modele}</span>}
                                      {loan.marque && <span className="spec-item">Marque: {loan.marque}</span>}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="col-client">
                                <span title={loan.client}>{loan.client || 'N/A'}</span>
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
                                <span className="days-badge" style={{backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6'}}>
                                  {loan.businessDaysThisMonth || 0} j
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="loans-info">
                    ℹ️ Ces matériels sont en prêt et ne sont pas factured au client. Ils sont listés ici à titre informatif pour traçabilité.
                  </p>
                </div>
              )}

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
