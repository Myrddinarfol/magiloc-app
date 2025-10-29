import React, { useState, useEffect } from 'react';
import './ClientDetailsModal.css';

const ClientDetailsModal = ({ isOpen, onClose, clientName, pieChartMode, month, year, locationData }) => {
  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    if (!locationData) return;

    // Filtrer les locations du client selon le mode
    const locations = locationData.filter(loc => {
      if (pieChartMode === 'month') {
        // Vérifier si la location chevauche le mois
        const locStart = new Date(loc.startDate || loc.date_debut);
        const locEnd = new Date(loc.endDate || loc.date_retour_reel || loc.date_fin_theorique || new Date());

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        return locStart <= monthEnd && locEnd >= monthStart;
      } else {
        // Mode année: toutes les locations de l'année
        const locStart = new Date(loc.startDate || loc.date_debut);
        return locStart.getFullYear() === year;
      }
    });

    setFilteredLocations(locations);
  }, [locationData, pieChartMode, month, year]);

  if (!isOpen) return null;

  const totalCA = filteredLocations.reduce((sum, loc) => sum + (loc.ca || loc.caThisMonth || loc.caConfirmedThisMonth || 0), 0);
  const timeLabel = pieChartMode === 'month'
    ? new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : year;

  return (
    <div className="client-details-overlay" onClick={onClose}>
      <div className="client-details-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="client-details-header">
          <div className="client-details-title-section">
            <h2 className="client-details-title">👥 {clientName}</h2>
            <p className="client-details-period">Période: {timeLabel}</p>
          </div>
          <button className="client-details-close" onClick={onClose}>✕</button>
        </div>

        {/* Summary Stats */}
        <div className="client-details-stats">
          <div className="stat-card">
            <div className="stat-label">CA Total</div>
            <div className="stat-value">{totalCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Locations</div>
            <div className="stat-value">{filteredLocations.length}</div>
          </div>
        </div>

        {/* Locations Table */}
        <div className="client-details-content">
          <h3 className="locations-title">📋 Historique des Locations</h3>

          {filteredLocations.length === 0 ? (
            <div className="no-data-message">Aucune location pour cette période</div>
          ) : (
            <div className="locations-table-wrapper">
              <table className="locations-table">
                <thead>
                  <tr>
                    <th>Matériel</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Jours</th>
                    <th>Tarif/jour</th>
                    <th>CA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((loc, idx) => (
                    <tr key={idx}>
                      <td>{loc.designation || loc.equipment_designation || 'N/A'}</td>
                      <td>{new Date(loc.startDate || loc.date_debut).toLocaleDateString('fr-FR')}</td>
                      <td>{new Date(loc.endDate || loc.date_retour_reel || loc.date_fin_theorique || new Date()).toLocaleDateString('fr-FR')}</td>
                      <td>{loc.businessDaysThisMonth || '-'}</td>
                      <td>{(loc.dailyRate || loc.prix_ht_jour || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="ca-cell">{(loc.ca || loc.caThisMonth || loc.caConfirmedThisMonth || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
