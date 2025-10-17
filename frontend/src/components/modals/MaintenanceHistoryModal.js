import React from 'react';
import './HistoryModals.css';

const MaintenanceHistoryModal = ({ history, onClose }) => {
  const formatTravaux = (travaux) => {
    if (!travaux) return 'Non renseigné';

    // Si c'est un string JSON, essayer de parser
    if (typeof travaux === 'string') {
      try {
        const parsed = JSON.parse(travaux);
        if (parsed.notes_maintenance) return parsed.notes_maintenance;
        if (parsed.pieces_utilisees) {
          const pieces = parsed.pieces_utilisees;
          if (Array.isArray(pieces) && pieces.length > 0) {
            return pieces.map(p => p.designation).join(', ');
          }
        }
      } catch (e) {
        return travaux;
      }
    }
    return travaux;
  };

  return (
    <div className="history-overlay">
      <div className="history-modal">
        {/* Header */}
        <div className="history-modal-header">
          <div className="history-modal-title">
            <span className="history-modal-icon">🔧</span>
            <h2>Historique de Maintenance</h2>
            <span className="history-count">{history.length}</span>
          </div>
          <button onClick={onClose} className="history-close-btn">✕</button>
        </div>

        {/* Content */}
        <div className="history-modal-content">
          {history.length === 0 ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">🔧</div>
              <p>Aucun historique de maintenance pour cet équipement</p>
            </div>
          ) : (
            <div className="history-scroll-container">
              <table className="history-data-table maintenance-table">
                <thead>
                  <tr>
                    <th className="col-dates">Période</th>
                    <th className="col-motif">Motif</th>
                    <th className="col-duration">Durée</th>
                    <th className="col-travaux">Travaux effectués</th>
                    <th className="col-notes">Notes retour</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((maint, index) => {
                    const dureeMaintenance = maint.duree_jours ? `${maint.duree_jours} j` : 'N/A';

                    return (
                      <tr key={index} className="history-row">
                        <td className="col-dates">
                          <div className="maintenance-dates">
                            <span className="date-label">Entrée:</span>
                            <span className="date-value">{maint.date_entree ? new Date(maint.date_entree).toLocaleDateString('fr-FR') : 'N/A'}</span>
                            <span className="date-label">Sortie:</span>
                            <span className="date-value">{maint.date_sortie ? new Date(maint.date_sortie).toLocaleDateString('fr-FR') : 'En cours'}</span>
                          </div>
                        </td>
                        <td className="col-motif">
                          <span className="maintenance-motif">{maint.motif_maintenance || 'N/A'}</span>
                        </td>
                        <td className="col-duration">
                          <span className="maintenance-duration-badge">{dureeMaintenance}</span>
                        </td>
                        <td className="col-travaux">
                          <span className="maintenance-travaux" title={formatTravaux(maint.travaux_effectues)}>
                            {formatTravaux(maint.travaux_effectues)}
                          </span>
                        </td>
                        <td className="col-notes">
                          {maint.note_retour ? (
                            <span className="maintenance-note-text" title={maint.note_retour}>
                              {maint.note_retour}
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

export default MaintenanceHistoryModal;
