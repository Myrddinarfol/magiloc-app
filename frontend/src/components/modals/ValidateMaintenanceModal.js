import React, { useState } from 'react';
import './ValidateMaintenanceModal.css';

const ValidateMaintenanceModal = ({
  equipment,
  maintenance,
  onConfirm,
  onCancel
}) => {
  const [vgpDone, setVgpDone] = useState(maintenance?.vgp_effectuee || false);

  // Calculer le coût total des pièces (si dispo)
  const totalSparePartsCost = maintenance?.pieces_utilisees?.reduce((sum, piece) => {
    return sum + ((piece.cost || 0) * (piece.quantite || 1));
  }, 0) || 0;

  const handleConfirm = () => {
    onConfirm({
      ...maintenance,
      vgp_effectuee: vgpDone
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content validate-maintenance-modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <h2>🔧 Récapitulatif de Maintenance</h2>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* ÉQUIPEMENT INFO */}
          <div className="recap-section equipment-recap">
            <h3>📦 ÉQUIPEMENT</h3>
            <div className="recap-grid">
              <div className="recap-item">
                <span className="recap-label">Désignation</span>
                <span className="recap-value">{equipment.designation} {equipment.cmu}</span>
              </div>
              <div className="recap-item">
                <span className="recap-label">Modèle</span>
                <span className="recap-value">{equipment.modele || 'N/A'}</span>
              </div>
              <div className="recap-item">
                <span className="recap-label">Marque</span>
                <span className="recap-value">{equipment.marque || 'N/A'}</span>
              </div>
              <div className="recap-item">
                <span className="recap-label">N° Série</span>
                <span className="recap-value serial">{equipment.numeroSerie}</span>
              </div>
            </div>
          </div>

          {/* MOTIF DE MAINTENANCE */}
          {maintenance?.motif_maintenance && (
            <div className="recap-section motif-recap" style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.05))',
              borderLeft: '4px solid #dc2626',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>🔴 MOTIF DE MAINTENANCE</h3>
              <p className="recap-text" style={{ margin: '0', color: '#fff', fontSize: '14px' }}>{maintenance.motif_maintenance}</p>
            </div>
          )}

          {/* TRAVAUX EFFECTUÉS - NOTES DE MAINTENANCE */}
          {maintenance?.notes_maintenance && (
            <div className="recap-section notes-recap" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
              borderLeft: '4px solid #3b82f6',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>📝 TRAVAUX EFFECTUÉS</h3>
              <p className="recap-text" style={{ margin: '0', color: '#fff', fontSize: '14px', lineHeight: '1.5' }}>{maintenance.notes_maintenance}</p>
            </div>
          )}

          {/* RÉSUMÉ PIÈCES ET TEMPS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            {/* PIÈCES DÉTACHÉES */}
            {maintenance?.pieces_utilisees && maintenance.pieces_utilisees.length > 0 && (
              <div className="recap-section pieces-recap" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                borderLeft: '4px solid #10b981',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '14px' }}>🔧 PIÈCES UTILISÉES</h4>
                <div style={{ fontSize: '13px', color: '#d1d5db' }}>
                  <strong style={{ color: '#10b981', fontSize: '18px' }}>{maintenance.pieces_utilisees.length}</strong> pièce{maintenance.pieces_utilisees.length > 1 ? 's' : ''}
                </div>
                {totalSparePartsCost > 0 && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                    Coût: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{totalSparePartsCost.toFixed(2)}€</span>
                  </div>
                )}
              </div>
            )}

            {/* TEMPS DE MAIN D'ŒUVRE */}
            {maintenance?.main_oeuvre_heures && (
              <div className="recap-section temps-recap" style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
                borderLeft: '4px solid #f59e0b',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '14px' }}>⏱️ MAIN D'ŒUVRE</h4>
                <div style={{ fontSize: '13px', color: '#d1d5db' }}>
                  <strong style={{ color: '#f59e0b', fontSize: '18px' }}>{maintenance.main_oeuvre_heures}</strong> heure{maintenance.main_oeuvre_heures > 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {/* DÉTAIL PIÈCES DÉTACHÉES */}
          {maintenance?.pieces_utilisees && maintenance.pieces_utilisees.length > 0 && (
            <div className="recap-section pieces-detail" style={{
              background: 'rgba(55, 65, 81, 0.3)',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '12px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>Détail des pièces</h4>
              <div style={{ fontSize: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                {maintenance.pieces_utilisees.map((piece, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(75, 85, 99, 0.3)', color: '#d1d5db' }}>
                    <span>{piece.designation || 'Pièce'}</span>
                    <span style={{ color: '#9ca3af' }}>x{piece.quantite}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VGP QUESTION */}
          <div className="recap-section vgp-question">
            <h3>📅 VGP - VISITE GÉNÉRALE PÉRIODIQUE</h3>
            <div className="vgp-question-box">
              <p>La VGP a-t-elle été effectuée pendant cette maintenance ?</p>
              <div className="vgp-options">
                <label className="vgp-option">
                  <input
                    type="radio"
                    checked={vgpDone}
                    onChange={() => setVgpDone(true)}
                  />
                  <span>✅ Oui, VGP effectuée</span>
                </label>
                <label className="vgp-option">
                  <input
                    type="radio"
                    checked={!vgpDone}
                    onChange={() => setVgpDone(false)}
                  />
                  <span>❌ Non, VGP non effectuée</span>
                </label>
              </div>

              {vgpDone && (
                <div className="vgp-confirmation">
                  ✅ La validité du VGP sera mise à jour automatiquement lors de la validation
                </div>
              )}
            </div>
          </div>

          {/* NOTES DE RETOUR */}
          {maintenance?.note_retour && (
            <div className="recap-section notes-retour-recap">
              <h3>📝 NOTES DE RETOUR</h3>
              <p className="recap-text">{maintenance.note_retour}</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            ← Annuler
          </button>
          <button className="btn btn-success" onClick={handleConfirm}>
            ✅ Valider la Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidateMaintenanceModal;
