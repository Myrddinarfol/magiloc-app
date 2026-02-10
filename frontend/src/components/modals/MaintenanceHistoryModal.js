import React from 'react';
import './HistoryModals.css';

const MaintenanceHistoryModal = ({ history, onClose }) => {
  // Parser le JSON travaux_effectues
  const parseTravauxData = (travaux) => {
    if (!travaux) return { travaux: '', vgpEffectuee: false, dureeDays: null };

    try {
      const parsed = typeof travaux === 'string' ? JSON.parse(travaux) : travaux;
      return {
        travaux: parsed,
        vgpEffectuee: parsed.vgp_effectuee || false,
        dureeDays: parsed.duree_jours || null
      };
    } catch (e) {
      return { travaux: travaux, vgpEffectuee: false, dureeDays: null };
    }
  };

  const formatTravaux = (travaux) => {
    if (!travaux) return '-';

    // Si c'est un string JSON, essayer de parser
    if (typeof travaux === 'string') {
      try {
        const parsed = JSON.parse(travaux);
        const parts = [];

        // Notes de maintenance
        if (parsed.notes_maintenance && parsed.notes_maintenance.trim()) {
          parts.push(`Notes: ${parsed.notes_maintenance}`);
        }

        // Pièces détachées utilisées
        if (parsed.pieces_utilisees && Array.isArray(parsed.pieces_utilisees) && parsed.pieces_utilisees.length > 0) {
          const piecesStr = parsed.pieces_utilisees.map(p => p.designation || p).join(', ');
          parts.push(`Pièces: ${piecesStr}`);
        }

        // Temps de main d'oeuvre
        if (parsed.temps_heures && parsed.temps_heures > 0) {
          parts.push(`Durée travail: ${parsed.temps_heures}h`);
        }

        // Si rien n'a été rempli
        if (parts.length === 0) {
          return '-';
        }

        return parts.join(' • ');
      } catch (e) {
        return travaux;
      }
    }
    return travaux;
  };

  // Calculer la durée totale de maintenance
  const calculateMaintenanceDuration = (maint) => {
    const parsedData = parseTravauxData(maint.travaux_effectues);

    // Si la durée est en JSON, l'utiliser
    if (parsedData.dureeDays !== null && parsedData.dureeDays > 0) {
      return `${parsedData.dureeDays} j`;
    }

    // Sinon, calculer à partir des dates
    if (maint.date_entree && maint.date_sortie) {
      const entree = new Date(maint.date_entree);
      const sortie = new Date(maint.date_sortie);
      const diffDays = Math.ceil((sortie - entree) / (1000 * 60 * 60 * 24));
      return `${diffDays} j`;
    }

    return 'En cours';
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
                    <th className="col-vgp">VGP effectuée</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((maint, index) => {
                    const parsedData = parseTravauxData(maint.travaux_effectues);
                    const dureeMaintenance = calculateMaintenanceDuration(maint);

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
                        <td className="col-vgp">
                          <span className="maintenance-vgp-badge">
                            {parsedData.vgpEffectuee ? '✅ Oui' : '❌ Non'}
                          </span>
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
