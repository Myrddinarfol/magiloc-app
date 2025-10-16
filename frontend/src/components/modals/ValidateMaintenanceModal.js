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
            <div className="recap-section motif-recap">
              <h3>🔴 MOTIF DE MAINTENANCE</h3>
              <p className="recap-text">{maintenance.motif_maintenance}</p>
            </div>
          )}

          {/* NOTES DE MAINTENANCE */}
          {maintenance?.notes_maintenance && (
            <div className="recap-section notes-recap">
              <h3>📝 NOTES DE MAINTENANCE</h3>
              <p className="recap-text">{maintenance.notes_maintenance}</p>
            </div>
          )}

          {/* PIÈCES DÉTACHÉES UTILISÉES */}
          {maintenance?.pieces_utilisees && maintenance.pieces_utilisees.length > 0 && (
            <div className="recap-section pieces-recap">
              <h3>🔧 PIÈCES DÉTACHÉES UTILISÉES</h3>
              <div className="pieces-table">
                <div className="pieces-header">
                  <div className="col-designation">Désignation</div>
                  <div className="col-quantity">Quantité</div>
                  <div className="col-cost">Coût Unitaire</div>
                </div>
                {maintenance.pieces_utilisees.map((piece, idx) => (
                  <div key={idx} className="pieces-row">
                    <div className="col-designation">{piece.designation || 'Non spécifié'}</div>
                    <div className="col-quantity">{piece.quantite}</div>
                    <div className="col-cost">{piece.cost ? `${piece.cost}€` : '-'}</div>
                  </div>
                ))}
              </div>
              {totalSparePartsCost > 0 && (
                <div className="pieces-total">
                  Coût total pièces: <strong>{totalSparePartsCost.toFixed(2)}€</strong>
                </div>
              )}
            </div>
          )}

          {/* TEMPS DE MAIN D'ŒUVRE */}
          {maintenance?.main_oeuvre_heures && (
            <div className="recap-section temps-recap">
              <h3>⏱️ TEMPS DE MAIN D'ŒUVRE</h3>
              <div className="temps-display">
                <span className="temps-value">{maintenance.main_oeuvre_heures}</span>
                <span className="temps-unit">heures</span>
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
