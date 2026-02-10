import React from 'react';
import './HistoryModals.css';

const MaintenanceHistoryModal = ({ history, onClose }) => {
  // Parser le JSON travaux_effectues pour extraire les données
  const getMaintenanceData = (maint) => {
    let vgpEffectuee = false;
    let dureeDays = null;

    // Essayer de parser le JSON travaux_effectues
    if (maint.travaux_effectues) {
      try {
        const parsed = typeof maint.travaux_effectues === 'string'
          ? JSON.parse(maint.travaux_effectues)
          : maint.travaux_effectues;

        vgpEffectuee = parsed.vgp_effectuee === true;
        dureeDays = parsed.duree_jours;
      } catch (e) {
        // Ignorer l'erreur de parsing
      }
    }

    return { vgpEffectuee, dureeDays };
  };

  const formatTravaux = (travaux) => {
    if (!travaux) return '-';

    if (typeof travaux === 'string') {
      try {
        const parsed = JSON.parse(travaux);
        const parts = [];

        if (parsed.notes_maintenance && parsed.notes_maintenance.trim()) {
          parts.push(`Notes: ${parsed.notes_maintenance}`);
        }

        if (parsed.pieces_utilisees && Array.isArray(parsed.pieces_utilisees) && parsed.pieces_utilisees.length > 0) {
          const piecesStr = parsed.pieces_utilisees.map(p => p.designation || p).join(', ');
          parts.push(`Pièces: ${piecesStr}`);
        }

        if (parsed.temps_heures && parsed.temps_heures > 0) {
          parts.push(`Main d'œuvre: ${parsed.temps_heures}h`);
        }

        return parts.length > 0 ? parts.join(' • ') : '-';
      } catch (e) {
        return travaux;
      }
    }
    return travaux;
  };

  const getMaintenanceDuration = (maint) => {
    const { dureeDays } = getMaintenanceData(maint);

    if (dureeDays && dureeDays > 0) {
      return `${dureeDays} j`;
    }

    if (maint.date_entree && maint.date_sortie) {
      try {
        const entree = new Date(maint.date_entree);
        const sortie = new Date(maint.date_sortie);
        const diff = Math.ceil((sortie - entree) / (1000 * 60 * 60 * 24));
        return `${diff} j`;
      } catch (e) {
        return 'N/A';
      }
    }

    return 'En cours';
  };

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-modal-header">
          <div className="history-modal-title">
            <span className="history-modal-icon">🔧</span>
            <h2>Historique de Maintenance</h2>
            <span className="history-count">{history.length}</span>
          </div>
          <button onClick={onClose} className="history-close-btn">✕</button>
        </div>

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
                    const { vgpEffectuee } = getMaintenanceData(maint);
                    const dureeMaintenance = getMaintenanceDuration(maint);

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
                            {vgpEffectuee ? '✅ Oui' : '❌ Non'}
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
