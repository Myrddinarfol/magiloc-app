import React, { useState } from 'react';
import { getStatusClass, getEtatClass } from '../../utils/statusHelpers';
import { calculateBusinessDays } from '../../utils/dateHelpers';
import VGPSection from './VGPSection';
import { useUI } from '../../hooks/useUI';
import CreateReservationModal from '../modals/CreateReservationModal';
import EditLocationModal from '../modals/EditLocationModal';

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
  onDelete,
  onCancelReservation,
  onCreateReservation,
  onEditLocationInfo
}) => {
  const { setShowReservationModal, setShowStartLocationModal, setShowReturnModal, setShowMaintenanceModal, setShowCompleteMaintenance, previousPage } = useUI();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCreateReservationModal, setShowCreateReservationModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Location</h3>
                {(currentPage === 'en-offre' || currentPage === 'location-list') && (
                  <button
                    className="btn btn-sm"
                    onClick={() => setShowEditLocationModal(true)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
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
                    title="Modifier les informations de location"
                  >
                    📝
                  </button>
                )}
              </div>
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
            </div>
          )}
        </div>

        {/* Section VGP */}
        <VGPSection equipment={equipment} onEditCertificat={onEditCertificat} />

        {/* Conteneur 2 panneaux côte à côte */}
        <div style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          {/* PANNEAU GAUCHE: Historique (consultation neutre) */}
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
            borderRadius: '12px',
            border: '2px solid #6b7280',
            boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
          }}>
            <h4 style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              📚 Historique
            </h4>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <button
                onClick={onLoadLocationHistory}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #4b5563, #374151)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 2px 8px rgba(75, 85, 99, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📜 Locations
              </button>
              <button
                onClick={onLoadMaintenanceHistory}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #4b5563, #374151)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 2px 8px rgba(75, 85, 99, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔧 Maintenance
              </button>
            </div>
          </div>

          {/* PANNEAU DROITE: Contrôle */}
          <div style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
            borderRadius: '12px',
            border: '2px solid #dc2626',
            boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
          }}>
            <h4 style={{
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ⚙️ Panneau de Contrôle
            </h4>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
            {/* STATUT: En Réservation */}
            {equipment.statut === 'En Réservation' && (
              <>
                <button
                  onClick={() => setShowStartLocationModal(true)}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🚀 Démarrer Location
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ❌ Annuler Réservation
                </button>
              </>
            )}

            {/* STATUT: En Location */}
            {equipment.statut === 'En Location' && (
              <button
                onClick={() => setShowReturnModal(true)}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ✅ Effectuer le Retour
              </button>
            )}

            {/* STATUT: Sur Parc */}
            {equipment.statut === 'Sur Parc' && (
              <>
                <button
                  onClick={() => setShowCreateReservationModal(true)}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  📋 Créer Réservation
                </button>
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔧 Mettre en Maintenance
                </button>
              </>
            )}

            {/* STATUT: En Maintenance */}
            {equipment.statut === 'En Maintenance' && previousPage === 'maintenance' && (
              <button
                onClick={() => setShowCompleteMaintenance(true)}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ✅ Valider Maintenance
              </button>
            )}

            {/* Boutons PARC LOC uniquement */}
            {previousPage === 'parc-loc' && (
              <>
                <button
                  onClick={onEditTechInfo}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  📝 Éditer Infos
                </button>
                <button
                  onClick={onDelete}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🗑️ Supprimer
                </button>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation de réservation */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
            border: '2px solid #dc2626',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(220, 38, 38, 0.4), 0 0 80px rgba(220, 38, 38, 0.2)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '15px',
                animation: 'bounce 1s ease-in-out infinite'
              }}>⚠️</div>
              <h2 style={{
                color: '#dc2626',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Confirmer l'annulation
              </h2>
              <p style={{
                color: '#d1d5db',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                Êtes-vous sûr de vouloir annuler cette réservation ?<br/>
                Le matériel sera remis sur parc.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, #4b5563, #6b7280)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancelReservation();
                }}
                style={{
                  padding: '12px 30px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de réservation */}
      <CreateReservationModal
        show={showCreateReservationModal}
        equipment={equipment}
        onConfirm={(formData) => {
          setShowCreateReservationModal(false);
          onCreateReservation(equipment, formData);
        }}
        onCancel={() => setShowCreateReservationModal(false)}
      />

      {/* Modal de modification des informations de location */}
      {showEditLocationModal && (
        <EditLocationModal
          equipment={equipment}
          onClose={() => setShowEditLocationModal(false)}
          onSuccess={(action) => {
            setShowEditLocationModal(false);
            if (onEditLocationInfo) {
              onEditLocationInfo(action);
            }
          }}
        />
      )}
    </div>
  );
};

export default EquipmentDetailView;
