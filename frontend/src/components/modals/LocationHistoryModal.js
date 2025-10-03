import React from 'react';

const LocationHistoryModal = ({ history, onClose }) => {
  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2>📜 Historique des Locations</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          {history.length === 0 ? (
            <p className="history-empty">
              📋 Aucun historique de location pour cet équipement
            </p>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Début</th>
                    <th>Retour réel</th>
                    <th>Durée</th>
                    <th>CA HT</th>
                    <th>N° Offre</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((loc, index) => {
                    const hasCA = loc.ca_total_ht && loc.duree_jours_ouvres && loc.prix_ht_jour;
                    const caDetail = hasCA
                      ? `${loc.duree_jours_ouvres}j × ${loc.prix_ht_jour}€/j${loc.remise_ld ? ' - 20% (LD)' : ''}`
                      : '';

                    return (
                      <tr key={index}>
                        <td className="history-client-name">{loc.client || 'N/A'}</td>
                        <td>{loc.date_debut ? new Date(loc.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</td>
                        <td>{loc.date_retour_reel ? new Date(loc.date_retour_reel).toLocaleDateString('fr-FR') : 'N/A'}</td>
                        <td>
                          {loc.duree_jours_ouvres ? (
                            <span className="history-duration">{loc.duree_jours_ouvres} j</span>
                          ) : 'N/A'}
                        </td>
                        <td>
                          {hasCA ? (
                            <div className="history-ca-container">
                              <span className="history-ca-amount">
                                {parseFloat(loc.ca_total_ht).toFixed(2)}€
                              </span>
                              <span className="history-ca-detail">
                                {caDetail}
                              </span>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td>{loc.numero_offre || '-'}</td>
                        <td>
                          {loc.note_retour ? (
                            <div className="history-note">{loc.note_retour}</div>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-gray">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationHistoryModal;
