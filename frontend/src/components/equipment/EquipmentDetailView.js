import React from 'react';
import { getStatusClass, getEtatClass } from '../../utils/statusHelpers';
import { calculateBusinessDays } from '../../utils/dateHelpers';
import VGPSection from './VGPSection';
import { useUI } from '../../hooks/useUI';

const EquipmentDetailView = ({
  equipment,
  currentPage,
  onClose,
  onEditCertificat,
  onOpenReservation,
  onStartLocation,
  onReturn,
  onEditTechInfo,
  onLoadLocationHistory,
  onLoadMaintenanceHistory,
  onDelete
}) => {
  const { setShowReservationModal, setShowStartLocationModal, setShowReturnModal, setShowMaintenanceModal, setShowCompleteMaintenance, previousPage } = useUI();

  return (
    <div>
      <button
        onClick={onClose}
        className="btn btn-gray"
        style={{ marginBottom: '20px' }}
      >
        ← Retour
      </button>

      <div className="detail-view">
        <div className="detail-header">
          <h2 className="detail-title">{equipment.designation} {equipment.cmu}</h2>
          <span className={`status-badge detail-status ${getStatusClass(equipment.statut)}`}>
            {equipment.statut}
          </span>
        </div>

        <div className="detail-grid">
          {/* Section Informations Techniques */}
          <div className="detail-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Informations techniques</h3>
              {currentPage === 'parc-loc' && (
                <button
                  className="btn btn-sm"
                  onClick={onEditTechInfo}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Modifier les informations techniques"
                >
                  📜
                </button>
              )}
            </div>
            <div className="detail-item">
              <span className="detail-label">Modèle:</span>
              <span className="detail-value">{equipment.modele || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Marque:</span>
              <span className="detail-value">{equipment.marque || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Longueur:</span>
              <span className="detail-value">{equipment.longueur || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">N° Série:</span>
              <span className="detail-value serial-number">{equipment.numeroSerie}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Prix HT/J:</span>
              <span className="detail-value">{equipment.prixHT ? `${equipment.prixHT} €` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">État:</span>
              <span className={`detail-value ${getEtatClass(equipment.etat)}`}>
                {equipment.etat}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Infos:</span>
              <span className="detail-value">{equipment.infosComplementaires || 'N/A'}</span>
            </div>
          </div>

          {/* Section Location - affichée uniquement pour "En Réservation" et "En Location" */}
          {(equipment.statut === 'En Réservation' || equipment.statut === 'En Location') && (
            <div className="detail-section">
              <h3>Location</h3>
              <div className="detail-item">
                <span className="detail-label">Client:</span>
                <span className="detail-value">{equipment.client || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Début location:</span>
                <span className="detail-value">{equipment.debutLocation || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fin théorique:</span>
                <span className="detail-value">{equipment.finLocationTheorique || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">N° Offre:</span>
                <span className="detail-value">{equipment.numeroOffre || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Notes:</span>
                <span className="detail-value">{equipment.notesLocation || 'N/A'}</span>
              </div>
              {(() => {
                const businessDays = calculateBusinessDays(
                  equipment.debutLocation,
                  equipment.finLocationTheorique
                );
                const isLongDuration = businessDays && businessDays >= 21;
                const prixHT = equipment.prixHT ? parseFloat(equipment.prixHT) : null;

                return (
                  <>
                    {businessDays !== null && (
                      <div className="detail-item">
                        <span className="detail-label">Durée (jours ouvrés):</span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#2196F3' }}>
                          {businessDays} jour{businessDays > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {isLongDuration && (
                      <div className="detail-item" style={{ backgroundColor: '#fff3e0', padding: '10px', borderRadius: '8px', border: '2px solid #ff9800' }}>
                        <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ✅ Location Longue Durée:
                        </span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#f57c00' }}>
                          Remise 20% applicable
                          {prixHT && ` (${(prixHT * 0.8).toFixed(2)}€/j au lieu de ${prixHT}€/j)`}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Section Maintenance - affichée uniquement pour "En Maintenance" quand on vient de l'onglet Maintenance */}
          {equipment.statut === 'En Maintenance' && previousPage === 'maintenance' && (
            <div className="detail-section">
              <h3>🔧 Gestion Maintenance</h3>
              <div className="maintenance-panel">
                <div className="maintenance-motif-box">
                  <h4>📋 Motif de maintenance</h4>
                  <div className="motif-content">
                    {equipment.motifMaintenance || 'Aucun motif renseigné'}
                  </div>
                </div>
                <div className="maintenance-notes-box">
                  <h4>📝 Notes de retour</h4>
                  <div className="notes-content">
                    {equipment.noteRetour || 'Aucune note de retour'}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-success btn-lg"
                onClick={() => setShowCompleteMaintenance(true)}
                style={{ marginTop: '15px', width: '100%' }}
              >
                ✅ Valider la Maintenance
              </button>
            </div>
          )}
        </div>

        {/* Section VGP */}
        <VGPSection equipment={equipment} onEditCertificat={onEditCertificat} />

        {/* Boutons Historiques */}
        <div className="history-section" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            className="btn btn-lg"
            onClick={onLoadLocationHistory}
            style={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              color: 'white',
              border: 'none',
              width: '100%'
            }}
          >
            📜 Historique Locations
          </button>
          <button
            className="btn btn-lg"
            onClick={onLoadMaintenanceHistory}
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: 'white',
              border: 'none',
              width: '100%'
            }}
          >
            🔧 Historique Maintenance
          </button>
        </div>

        {/* Boutons d'action selon le statut */}
        <div className="actions-container" style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {equipment.statut === 'En Réservation' && (
            <button
              className="btn btn-success btn-lg"
              onClick={() => setShowStartLocationModal(true)}
              style={{ gridColumn: '1 / -1' }}
            >
              🚀 Démarrer Location
            </button>
          )}
          {equipment.statut === 'En Location' && (
            <button
              className="btn btn-success btn-lg"
              onClick={() => setShowReturnModal(true)}
              style={{ gridColumn: '1 / -1' }}
            >
              ✅ Effectuer le retour
            </button>
          )}
          {equipment.statut !== 'En Location' && equipment.statut !== 'En Maintenance' && (
            <>
              <button
                className="btn btn-warning btn-lg"
                onClick={() => setShowReservationModal(true)}
              >
                Créer une Réservation
              </button>
              <button
                className="btn btn-lg"
                onClick={() => setShowMaintenanceModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none'
                }}
              >
                🔧 Mettre en Maintenance
              </button>
            </>
          )}
        </div>

        {/* Bouton Supprimer pour PARC LOC */}
        {previousPage === 'parc-loc' && (
          <div style={{ marginTop: '20px' }}>
            <button
              className="btn btn-lg"
              onClick={onDelete}
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: 'white',
                border: 'none',
                width: '100%'
              }}
            >
              🗑️ Supprimer ce matériel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetailView;
