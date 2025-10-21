import React, { useState } from 'react';
import { getStatusClass, getEtatClass } from '../../utils/statusHelpers';
import { calculateBusinessDays } from '../../utils/dateHelpers';
import VGPSection from './VGPSection';
import { useUI } from '../../hooks/useUI';
import CreateReservationModal from '../modals/CreateReservationModal';
import EditLocationModal from '../modals/EditLocationModal';
import MaintenanceManagementPanel from '../maintenance/MaintenanceManagementPanel';
import ValidateMaintenanceModal from '../modals/ValidateMaintenanceModal';
import StartLocationModal from '../modals/StartLocationModal';
import './EquipmentDetailView.css';

const EquipmentDetailView = ({
  equipment,
  currentPage,
  onClose,
  onEditCertificat,
  onOpenReservation,
  onStartLocation,
  onReturnLocation,
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
  const [showValidateMaintenanceModal, setShowValidateMaintenanceModal] = useState(false);
  const [showStartLocationModalDetail, setShowStartLocationModalDetail] = useState(false);
  const [showReturnModalDetail, setShowReturnModalDetail] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({});

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

        {/* LAYOUT 2 COLONNES POUR SUR PARC & PARC LOC */}
        {(currentPage === 'sur-parc' || currentPage === 'parc-loc') ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px'
          }}>
            {/* COLONNE GAUCHE: Infos Techniques + Panneau de Contrôle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  <span className="detail-label">Minimum de facturation:</span>
                  <span className="detail-value">{equipment.minimumFacturation ? `${equipment.minimumFacturation} €` : 'N/A'}</span>
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
                <div className="detail-item">
                  <span className="detail-label">ID ARTICLE:</span>
                  <span className="detail-value" style={{ fontFamily: 'monospace', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                    {equipment.idArticle || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Panneau de Contrôle - Gauche */}
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
                </div>
              </div>
            </div>

            {/* COLONNE DROITE: VGP + Historique */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* VGP Section */}
              <VGPSection equipment={equipment} onEditCertificat={onEditCertificat} />

              {/* Historique - Droite */}
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
            </div>
          </div>
        ) : (
          <>
            {/* LAYOUT ORIGINAL POUR LES AUTRES PAGES */}
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
                <span className="detail-label">Minimum de facturation:</span>
                <span className="detail-value">{equipment.minimumFacturation ? `${equipment.minimumFacturation} €` : 'N/A'}</span>
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
              <div className="detail-item">
                <span className="detail-label">ID ARTICLE:</span>
                <span className="detail-value" style={{ fontFamily: 'monospace', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  {equipment.idArticle || 'N/A'}
                </span>
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
                const prixHT = equipment.prixHT ? parseFloat(equipment.prixHT) : null;
                const isLongDuration = equipment.estLongDuree === true || equipment.estLongDuree === 1;

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
                    <div className="detail-item">
                      <span className="detail-label">Longue Durée:</span>
                      <span className="detail-value" style={{
                        fontWeight: 'bold',
                        color: isLongDuration ? '#10b981' : '#9ca3af',
                        padding: '4px 12px',
                        backgroundColor: isLongDuration ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {isLongDuration ? '✅ Oui (-20%)' : '❌ Non'}
                      </span>
                    </div>
                    {isLongDuration && prixHT && (
                      <div className="detail-item" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', border: '2px solid rgba(16, 185, 129, 0.3)' }}>
                        <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                          💰 Tarif appliqué:
                        </span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#10b981' }}>
                          {(prixHT * 0.8).toFixed(2)}€/j au lieu de {prixHT}€/j
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* LAYOUT 25/75 POUR MAINTENANCE */}
          {equipment.statut === 'En Maintenance' && previousPage === 'maintenance' && (
            <div className="maintenance-detail-layout">
              {/* SIDEBAR 25% - INFOS TECHNIQUES COMPACTES + HISTORIQUE */}
              <div className="maintenance-sidebar">
                {/* SECTION INFOS TECHNIQUES COMPACTE */}
                <div className="maintenance-sidebar-section">
                  <h4>📋 Infos Techniques</h4>
                  <div className="maintenance-sidebar-item">
                    <span className="maintenance-sidebar-label">Modèle</span>
                    <span className="maintenance-sidebar-value">{equipment.modele || 'N/A'}</span>
                  </div>
                  <div className="maintenance-sidebar-item">
                    <span className="maintenance-sidebar-label">Marque</span>
                    <span className="maintenance-sidebar-value">{equipment.marque || 'N/A'}</span>
                  </div>
                  <div className="maintenance-sidebar-item">
                    <span className="maintenance-sidebar-label">N° Série</span>
                    <span className="maintenance-sidebar-value serial">{equipment.numeroSerie}</span>
                  </div>
                  <div className="maintenance-sidebar-item">
                    <span className="maintenance-sidebar-label">Longueur</span>
                    <span className="maintenance-sidebar-value">{equipment.longueur || 'N/A'}</span>
                  </div>
                  <div className="maintenance-sidebar-item">
                    <span className="maintenance-sidebar-label">État</span>
                    <span className="maintenance-sidebar-value">{equipment.etat || 'N/A'}</span>
                  </div>
                </div>

                {/* SECTION HISTORIQUE */}
                <div className="maintenance-sidebar-section">
                  <h4>📚 Historique</h4>
                  <div className="maintenance-history-buttons">
                    <button
                      onClick={onLoadLocationHistory}
                      className="maintenance-history-btn"
                    >
                      📜 Locations
                    </button>
                    <button
                      onClick={onLoadMaintenanceHistory}
                      className="maintenance-history-btn"
                    >
                      🔧 Maintenance
                    </button>
                  </div>
                </div>
              </div>

              {/* CONTENT 75% - GESTION MAINTENANCE */}
              <div className="maintenance-content">
                <MaintenanceManagementPanel
                  equipment={equipment}
                  onValidateMaintenance={(data) => {
                    setMaintenanceData(data);
                    setShowValidateMaintenanceModal(true);
                  }}
                  maintenanceData={maintenanceData}
                />
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
                  onClick={() => setShowStartLocationModalDetail(true)}
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
                onClick={() => setShowReturnModalDetail(true)}
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
          </>
        )}
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

      {/* Modal de validation de maintenance */}
      {showValidateMaintenanceModal && (
        <ValidateMaintenanceModal
          equipment={equipment}
          maintenance={maintenanceData}
          onConfirm={(data) => {
            setShowValidateMaintenanceModal(false);
            // Appeler la fonction de sauvegarde maintenance
            // À implémenter: onValidateMaintenance(equipment, data);
            console.log('Maintenance validée:', data);
          }}
          onCancel={() => setShowValidateMaintenanceModal(false)}
        />
      )}

      {/* Modal de démarrage de location - Detail View */}
      {showStartLocationModalDetail && (
        <StartLocationModal
          show={true}
          equipment={equipment}
          onConfirm={(startDate) => {
            setShowStartLocationModalDetail(false);
            if (onStartLocation) {
              onStartLocation(equipment, startDate);
            }
          }}
          onCancel={() => setShowStartLocationModalDetail(false)}
        />
      )}

      {/* Modal de retour de location - Detail View */}
      {showReturnModalDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
            border: '3px solid #10b981',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.5)',
            animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              fontSize: '64px',
              textAlign: 'center',
              marginBottom: '20px',
              animation: 'bounce 0.6s ease-out'
            }}>
              ✅
            </div>

            <h2 style={{
              color: '#10b981',
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              Effectuer le retour
            </h2>

            {equipment && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {equipment.designation} {equipment.cmu}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                  {equipment.marque} {equipment.modele}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
                  N° Série: {equipment.numeroSerie}
                </div>
                {equipment.client && (
                  <div style={{ color: '#fbbf24', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                    Client: {equipment.client}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#d1d5db',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Date de retour <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                id="returnDate"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  color: '#fff',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#d1d5db',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Notes de retour
              </label>
              <textarea
                id="returnNotes"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  color: '#fff',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  minHeight: '100px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Condition du matériel, remarques, etc..."
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowReturnModalDetail(false)}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#9ca3af',
                  background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.6), rgba(31, 41, 55, 0.6))',
                  border: '2px solid rgba(75, 85, 99, 0.8)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.8))';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(55, 65, 81, 0.6), rgba(31, 41, 55, 0.6))';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ✕ Annuler
              </button>

              <button
                onClick={() => {
                  const returnDate = document.getElementById('returnDate')?.value;
                  const returnNotes = document.getElementById('returnNotes')?.value;

                  if (!returnDate) {
                    alert('Veuillez saisir la date de retour');
                    return;
                  }

                  setShowReturnModalDetail(false);
                  if (onReturnLocation) {
                    onReturnLocation(equipment, returnDate, returnNotes);
                  }
                }}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #34d399, #10b981)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                ✅ Effectuer le retour
              </button>
            </div>

            <style>
              {`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }

                @keyframes slideUp {
                  from {
                    transform: translateY(30px);
                    opacity: 0;
                  }
                  to {
                    transform: translateY(0);
                    opacity: 1;
                  }
                }

                @keyframes bounce {
                  0%, 100% {
                    transform: translateY(0);
                  }
                  50% {
                    transform: translateY(-10px);
                  }
                }
              `}
            </style>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetailView;
