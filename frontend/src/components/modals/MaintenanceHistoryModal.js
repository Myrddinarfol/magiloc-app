import React from 'react';

const MaintenanceHistoryModal = ({ history, onClose }) => {
  return (
    <div className="release-notes-overlay">
      <div className="reservation-modal" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2>🔧 Historique de Maintenance</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Aucun historique de maintenance pour cet équipement
            </p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Entrée</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Sortie</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Motif</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Note retour</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Travaux</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((maint, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        {maint.date_entree ? new Date(maint.date_entree).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {maint.date_sortie ? new Date(maint.date_sortie).toLocaleDateString('fr-FR') : 'En cours'}
                      </td>
                      <td style={{ padding: '12px' }}>{maint.motif_maintenance || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '0.9em', fontStyle: 'italic', color: '#ff6b6b' }}>
                        {maint.note_retour || '-'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.9em' }}>
                        {maint.travaux_effectues || 'Non renseigné'}
                      </td>
                    </tr>
                  ))}
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

export default MaintenanceHistoryModal;
