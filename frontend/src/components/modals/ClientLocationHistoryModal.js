import React from 'react';
import './HistoryModals.css';

const ClientLocationHistoryModal = ({ clientName, history, onClose }) => {
  // Fonction pour calculer le CA d'une location
  const calculateLocationCA = (loc) => {
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

  // Calculer le CA total pour ce client
  const totalCA = history.reduce((sum, loc) => {
    const ca = calculateLocationCA(loc);
    return sum + (ca || 0);
  }, 0);

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
                    <th className="col-tarif">Tarif/jour</th>
                    <th className="col-ca">CA HT</th>
                    <th className="col-offre">Offre</th>
                    <th className="col-notes">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((loc, index) => {
                    // Utiliser la fonction helper pour calculer le CA
                    const calculatedCA = calculateLocationCA(loc);
                    const hasCA = calculatedCA !== null && calculatedCA !== undefined;
                    const caDetail = hasCA
                      ? `${loc.duree_jours_ouvres}j × ${parseFloat(loc.prix_ht_jour).toFixed(2)}€/j${loc.remise_ld ? ' -20%' : ''}`
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
                          {loc.duree_jours_ouvres ? (
                            <span className="history-duration-badge">{loc.duree_jours_ouvres} j</span>
                          ) : <span className="history-na">N/A</span>}
                        </td>
                        <td className="col-tarif">
                          {loc.prix_ht_jour ? (
                            <span className="history-tarif">{parseFloat(loc.prix_ht_jour).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                          ) : <span className="history-na">N/A</span>}
                        </td>
                        <td className="col-ca">
                          {hasCA ? (
                            <div className="history-ca-info">
                              <span className="ca-amount">{calculatedCA.toFixed(2)}€</span>
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
          <div className="history-total-ca">
            <span className="history-total-label">CA Total pour ce client:</span>
            <span className="history-total-value">{totalCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
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
