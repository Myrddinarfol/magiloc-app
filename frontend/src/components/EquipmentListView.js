import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUI } from '../hooks/useUI';
import PageHeader from './common/PageHeader';
import VGPBadgeCompact from './common/VGPBadgeCompact';
import CancelReservationModal from './modals/CancelReservationModal';
import StartLocationModal from './modals/StartLocationModal';
import ReturnModal from './modals/ReturnModal';
import CreateReservationModal from './modals/CreateReservationModal';
import ExchangeModal from './modals/ExchangeModal';
import { smartSearchWithScore } from '../utils/smartSearch';

function EquipmentListView({
  equipmentData,
  currentPage,
  setSelectedEquipment,
  handleOpenEquipmentDetail,
  getStatusClass,
  setShowImporter,
  setShowAddEquipmentModal,
  onCancelReservation,
  onCreateReservation,
  onReturnLocation,
  onStartLocation
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterCMU, setFilterCMU] = useState('');
  const [filterLongueur, setFilterLongueur] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [equipmentToCancel, setEquipmentToCancel] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [equipmentToStart, setEquipmentToStart] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [equipmentToReturn, setEquipmentToReturn] = useState(null);
  const [showCreateReservationModal, setShowCreateReservationModal] = useState(false);
  const [equipmentToReserve, setEquipmentToReserve] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [equipmentToExchange, setEquipmentToExchange] = useState(null);
  const { equipmentFilter, setEquipmentFilter } = useUI();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 🔄 Initialiser les filtres depuis l'URL au mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const designationFromUrl = searchParams.get('designation') || '';
    const cmuFromUrl = searchParams.get('cmu') || '';
    const longueurFromUrl = searchParams.get('longueur') || '';

    setSearchTerm(searchFromUrl);
    setFilterDesignation(designationFromUrl);
    setFilterCMU(cmuFromUrl);
    setFilterLongueur(longueurFromUrl);
  }, []); // ⚠️ Uniquement au mount, pas à chaque changement d'URL

  // 🔄 Mettre à jour l'URL quand les filtres changent
  useEffect(() => {
    const newParams = new URLSearchParams();

    if (searchTerm) newParams.set('search', searchTerm);
    if (filterDesignation) newParams.set('designation', filterDesignation);
    if (filterCMU) newParams.set('cmu', filterCMU);
    if (filterLongueur) newParams.set('longueur', filterLongueur);

    // Mettre à jour l'URL sans recharger la page
    setSearchParams(newParams);
  }, [searchTerm, filterDesignation, filterCMU, filterLongueur, setSearchParams]);

  // Auto-reset filter when leaving sur-parc
  useEffect(() => {
    if (currentPage !== 'sur-parc' && equipmentFilter) {
      setEquipmentFilter(null);
    }
  }, [currentPage, equipmentFilter, setEquipmentFilter]);

  // Réinitialiser les filtres CMU et longueur lorsque la désignation change
  useEffect(() => {
    setFilterCMU('');
    setFilterLongueur('');
  }, [filterDesignation]);

  // Fonction pour calculer l'état du VGP avec date affichée
  const getVGPStatus = (prochainVGP) => {
    if (!prochainVGP) return {
      date: '-',
      class: 'vgp-gray',
      animated: false
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parser la date (format DD/MM/YYYY ou YYYY-MM-DD)
    let vgpDate;
    if (prochainVGP.includes('/')) {
      const [day, month, year] = prochainVGP.split('/');
      vgpDate = new Date(year, month - 1, day);
    } else {
      vgpDate = new Date(prochainVGP);
    }
    vgpDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((vgpDate - today) / (1000 * 60 * 60 * 24));

    // Formater la date en DD/MM/YYYY
    const dateFormatted = vgpDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (diffDays < 0) {
      // VGP DÉPASSÉ - Rouge avec animation
      return {
        date: dateFormatted,
        class: 'vgp-red',
        animated: true,
        status: 'Dépassé'
      };
    } else if (diffDays <= 30) {
      // VGP À PRÉVOIR - Orange avec animation
      return {
        date: dateFormatted,
        class: 'vgp-orange',
        animated: true,
        status: `${diffDays}j`
      };
    } else {
      // VGP À JOUR - Vert
      return {
        date: dateFormatted,
        class: 'vgp-green',
        animated: false,
        status: 'OK'
      };
    }
  };

  // Fonction pour obtenir la classe CSS de l'état du matériel
  const getEtatClass = (etat) => {
    if (!etat) return 'etat-badge';

    switch (etat.toLowerCase()) {
      case 'neuf':
        return 'etat-badge etat-neuf';
      case 'bon':
        return 'etat-badge etat-bon';
      case 'moyen':
        return 'etat-badge etat-moyen';
      case 'vieillissant':
      case 'usagé':
        return 'etat-badge etat-vieillissant';
      default:
        return 'etat-badge';
    }
  };

  // Fonction pour vérifier si une réservation est dépassée
  const isReservationOverdue = (debutLocation) => {
    if (!debutLocation) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parser la date (format DD/MM/YYYY ou YYYY-MM-DD)
    let startDate;
    if (debutLocation.includes('/')) {
      const [day, month, year] = debutLocation.split('/');
      startDate = new Date(year, month - 1, day);
    } else {
      startDate = new Date(debutLocation);
    }
    startDate.setHours(0, 0, 0, 0);

    return startDate < today;
  };

  // Extraire les options uniques pour les filtres (avec filtres en cascade)
  const filterOptions = useMemo(() => {
    if (currentPage !== 'sur-parc' && currentPage !== 'parc-loc') return {};

    // Filtrer d'abord par statut selon la page
    let baseData = equipmentData;
    if (currentPage === 'sur-parc') {
      baseData = equipmentData.filter(eq => eq.statut === 'Sur Parc');
    }

    // Les désignations sont toujours basées sur tous les équipements de la page
    const designations = [...new Set(baseData.map(eq => eq.designation).filter(Boolean))].sort();

    // Les CMU et longueurs dépendent de la désignation sélectionnée
    let cmuData = baseData;
    let longueurData = baseData;

    if (filterDesignation) {
      cmuData = baseData.filter(eq => eq.designation && eq.designation.toLowerCase().includes(filterDesignation.toLowerCase()));
      longueurData = cmuData; // Les longueurs dépendent aussi de la désignation
    }

    const cmus = [...new Set(cmuData.map(eq => eq.cmu).filter(Boolean))].sort();
    const longueurs = [...new Set(longueurData.map(eq => eq.longueur).filter(Boolean))].sort();

    return { designations, cmus, longueurs };
  }, [equipmentData, currentPage, filterDesignation]);

  // Configuration des pages
  const getPageHeaderInfo = () => {
    switch (currentPage) {
      case 'sur-parc':
        return {
          icon: '📦',
          title: 'Sur Parc',
          subtitle: 'MATÉRIEL DISPONIBLE',
          description: 'Matériel disponible à la location'
        };
      case 'en-offre':
        return {
          icon: '📋',
          title: 'Réservations',
          subtitle: 'RÉSERVATIONS EN COURS',
          description: 'Matériel réservé en attente de départ en location'
        };
      case 'location-list':
        return {
          icon: '🚚',
          title: 'Locations en cours',
          subtitle: 'MATÉRIEL EN LOCATION',
          description: 'Matériel actuellement loué aux clients'
        };
      case 'maintenance':
        return {
          icon: '🔧',
          title: 'Matériels en maintenance',
          subtitle: 'MAINTENANCE EN COURS',
          description: 'Matériel en cours de vérification ou réparation'
        };
      case 'parc-loc':
        return {
          icon: '🏢',
          title: 'Parc Location',
          subtitle: 'GESTION COMPLÈTE DU PARC',
          description: 'Vue complète de tous les équipements'
        };
      default:
        return {
          icon: '📦',
          title: 'Équipements',
          subtitle: 'GESTION',
          description: 'Liste des équipements'
        };
    }
  };

  // Calcul des données filtrées
  const filteredData = useMemo(() => {
    let filtered = equipmentData;

    // Filtrage par page
    switch (currentPage) {
      case 'sur-parc':
        filtered = equipmentData.filter(eq => eq.statut === 'Sur Parc');
        break;
      case 'en-offre':
        filtered = equipmentData.filter(eq => eq.statut === 'En Réservation');
        break;
      case 'location-list':
        filtered = equipmentData.filter(eq => eq.statut === 'En Location');
        break;
      case 'maintenance':
        filtered = equipmentData.filter(eq => eq.statut === 'En Maintenance');
        break;
      case 'parc-loc':
        // Affiche tout
        filtered = equipmentData;
        break;
      default:
        filtered = equipmentData;
    }

    // Filtrage par modèle (depuis dashboard matériels phares)
    if (equipmentFilter && equipmentFilter.models && currentPage === 'sur-parc') {
      filtered = filtered.filter(eq =>
        equipmentFilter.models.some(model =>
          eq.modele && eq.modele.toUpperCase().includes(model.toUpperCase())
        )
      );
    }

    // Filtres additionnels pour SUR PARC et PARC LOC
    if ((currentPage === 'sur-parc' || currentPage === 'parc-loc') && filterDesignation) {
      filtered = filtered.filter(eq =>
        eq.designation && eq.designation.toLowerCase().includes(filterDesignation.toLowerCase())
      );
    }

    if ((currentPage === 'sur-parc' || currentPage === 'parc-loc') && filterCMU) {
      filtered = filtered.filter(eq =>
        eq.cmu && eq.cmu.toLowerCase().includes(filterCMU.toLowerCase())
      );
    }

    if ((currentPage === 'sur-parc' || currentPage === 'parc-loc') && filterLongueur) {
      filtered = filtered.filter(eq =>
        eq.longueur && eq.longueur.toLowerCase().includes(filterLongueur.toLowerCase())
      );
    }

    // Recherche textuelle intelligente
    if (searchTerm) {
      const results = filtered
        .map(equipment => ({
          equipment,
          ...smartSearchWithScore(equipment, searchTerm)
        }))
        .filter(item => item.match)
        .sort((a, b) => b.score - a.score)
        .map(item => item.equipment);

      return results;
    }

    return filtered;
  }, [equipmentData, currentPage, searchTerm, equipmentFilter, filterDesignation, filterCMU, filterLongueur]);

  const pageHeader = getPageHeaderInfo();

  return (
    <div className="equipment-list-page">
      <PageHeader
        icon={pageHeader.icon}
        title={pageHeader.title}
        subtitle={pageHeader.subtitle}
        description={pageHeader.description}
      />

      {/* Filtres et Recherche - Même capsule */}
      {(currentPage === 'sur-parc' || currentPage === 'parc-loc') && (
        <div className="filters-search-block">
          {/* Filtres avancés pour SUR PARC et PARC LOC */}
          <div className="filters-container" style={{
            display: 'flex',
            gap: '10px',
            margin: '0',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '20px 30px',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
              <select
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '2px solid #1f2937',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '200px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="" style={{backgroundColor: '#1f2937'}}>Toutes les désignations</option>
                {filterOptions.designations?.map(designation => (
                  <option key={designation} value={designation} style={{backgroundColor: '#1f2937'}}>{designation}</option>
                ))}
              </select>

              <select
                value={filterCMU}
                onChange={(e) => setFilterCMU(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '2px solid #1f2937',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '150px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="" style={{backgroundColor: '#1f2937'}}>Toutes les CMU</option>
                {filterOptions.cmus?.map(cmu => (
                  <option key={cmu} value={cmu} style={{backgroundColor: '#1f2937'}}>{cmu}</option>
                ))}
              </select>

              <select
                value={filterLongueur}
                onChange={(e) => setFilterLongueur(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '2px solid #1f2937',
                  backgroundColor: '#111827',
                  color: 'white',
                  fontSize: '14px',
                  minWidth: '150px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="" style={{backgroundColor: '#1f2937'}}>Toutes les longueurs</option>
                {filterOptions.longueurs?.map(longueur => (
                  <option key={longueur} value={longueur} style={{backgroundColor: '#1f2937'}}>{longueur}</option>
                ))}
              </select>

              {(filterDesignation || filterCMU || filterLongueur) && (
                <button
                  onClick={() => {
                    setFilterDesignation('');
                    setFilterCMU('');
                    setFilterLongueur('');
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '2px solid #dc2626',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                ✕ Effacer filtres
              </button>
              )}
            </div>

            {/* Boutons d'action PARC LOC - à droite */}
            {currentPage === 'parc-loc' && setShowImporter && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setShowAddEquipmentModal(true)}
                  className="btn btn-primary parc-loc-btn"
                >
                  ➕ Ajouter
                </button>
                <button
                  onClick={() => setShowImporter(true)}
                  className="btn btn-primary parc-loc-btn"
                >
                  📥 CSV
                </button>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setEquipmentFilter(null);
                    setFilterDesignation('');
                    setFilterCMU('');
                    setFilterLongueur('');
                  }}
                  className="btn btn-reset parc-loc-btn"
                >
                  🔄 Réinit
                </button>
              </div>
            )}
          </div>

          {/* Barre de recherche - Inside same block */}
          <div className="search-container-inner" style={{
            display: 'flex',
            gap: '10px',
            padding: '0 30px 20px 30px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Rechercher par désignation, modèle, n° série ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ flex: 1 }}
            />
            {equipmentFilter && currentPage === 'sur-parc' && (
              <button
                onClick={() => setEquipmentFilter(null)}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '10px' }}
              >
                ✕ Effacer filtre
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nombre de résultats */}
      <div className="results-count" style={{ margin: '10px 0', color: '#9ca3af' }}>
        {filteredData.length} équipement{filteredData.length > 1 ? 's' : ''} trouvé{filteredData.length > 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {(currentPage === 'sur-parc' || currentPage === 'parc-loc') ? (
                  <>
                    <th>Équipement</th>
                    <th>Longueur</th>
                    <th>N° Série</th>
                    <th>Statut</th>
                    <th>État</th>
                    <th>Prochain VGP</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>Équipement</th>
                    <th>N° Série</th>
                    <th>Statut</th>
                    <th>Client</th>
                    <th>Dates</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((equipment) => {
                const vgpStatus = getVGPStatus(equipment.prochainVgp);

                return (
                  <tr key={equipment.id}>
                    {(currentPage === 'sur-parc' || currentPage === 'parc-loc') ? (
                      <>
                        <td>
                          <div className="equipment-name">
                            {equipment.designation} {equipment.cmu}
                          </div>
                          <div className="equipment-details">
                            {equipment.marque} {equipment.modele}
                          </div>
                        </td>
                        <td>{equipment.longueur || '-'}</td>
                        <td>
                          <span className="serial-number">{equipment.numeroSerie}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(equipment.statut)}`}>
                            {equipment.statut}
                          </span>
                        </td>
                        <td>
                          <span className={getEtatClass(equipment.etat)}>
                            {equipment.etat || '-'}
                          </span>
                        </td>
                        <td>
                          <VGPBadgeCompact prochainVGP={equipment.prochainVgp || equipment.prochainVGP} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEquipmentDetail(equipment, currentPage);
                              }}
                              className="btn-icon"
                              data-tooltip="Voir détails"
                            >
                              📜
                            </button>
                            {currentPage === 'sur-parc' && onCreateReservation && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEquipmentToReserve(equipment);
                                  setShowCreateReservationModal(true);
                                }}
                                className="btn-icon btn-reservation"
                                data-tooltip="Créer une réservation"
                              >
                                📋
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="equipment-name">
                            {equipment.designation} {equipment.cmu}
                          </div>
                          <div className="equipment-details">
                            {equipment.marque} {equipment.modele}
                          </div>
                        </td>
                        <td>
                          <span className="serial-number">{equipment.numeroSerie}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(equipment.statut)}`}>
                            {equipment.statut}
                          </span>
                        </td>
                        <td>{equipment.client || '-'}</td>
                        <td>
                          {equipment.debutLocation && (
                            <div style={{ position: 'relative' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Début: {equipment.debutLocation}</span>
                                {currentPage === 'en-offre' && isReservationOverdue(equipment.debutLocation) && (
                                  <span className="reservation-overdue-badge">
                                    ⚠️ RETARD
                                  </span>
                                )}
                              </div>
                              {equipment.finLocationTheorique && (
                                <div>Fin: {equipment.finLocationTheorique}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentPage === 'maintenance') {
                                  navigate(`/maintenance/${equipment.id}`);
                                } else {
                                  handleOpenEquipmentDetail(equipment, currentPage);
                                }
                              }}
                              className="btn-icon"
                              data-tooltip={currentPage === 'maintenance' ? 'Effectuer une maintenance' : 'Voir détails'}
                            >
                              {currentPage === 'maintenance' ? '🛠️' : '📜'}
                            </button>
                            {currentPage === 'en-offre' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEquipmentToStart(equipment);
                                  setShowStartModal(true);
                                }}
                                className="btn-icon btn-start-location"
                                data-tooltip="Démarrer la location"
                              >
                                🚀
                              </button>
                            )}
                            {currentPage === 'en-offre' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEquipmentToExchange(equipment);
                                  setShowExchangeModal(true);
                                }}
                                className="btn-icon btn-exchange"
                                data-tooltip="Échanger ce matériel"
                              >
                                🔄
                              </button>
                            )}
                            {currentPage === 'en-offre' && onCancelReservation && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEquipmentToCancel(equipment);
                                  setShowCancelModal(true);
                                }}
                                className="btn-icon btn-cancel"
                                data-tooltip="Annuler la réservation"
                              >
                                ❌
                              </button>
                            )}
                            {currentPage === 'location-list' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEquipmentToExchange(equipment);
                                  setShowExchangeModal(true);
                                }}
                                className="btn-icon btn-exchange"
                                data-tooltip="Échanger ce matériel"
                              >
                                🔄
                              </button>
                            )}
                            {currentPage === 'location-list' && onReturnLocation && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEquipmentToReturn(equipment);
                                  setShowReturnModal(true);
                                }}
                                className="btn-icon btn-return"
                                data-tooltip="Effectuer le retour"
                              >
                                ↩️
                              </button>
                            )}

                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="empty-state">
          Aucun équipement trouvé.
        </div>
      )}

      {/* Modal d'annulation de réservation */}
      <CancelReservationModal
        show={showCancelModal}
        equipment={equipmentToCancel}
        onConfirm={() => {
          if (equipmentToCancel && onCancelReservation) {
            onCancelReservation(equipmentToCancel);
          }
          setShowCancelModal(false);
          setEquipmentToCancel(null);
        }}
        onCancel={() => {
          setShowCancelModal(false);
          setEquipmentToCancel(null);
        }}
      />

      {/* Modal de démarrage de location */}
      <StartLocationModal
        show={showStartModal}
        equipment={equipmentToStart}
        onConfirm={(startDate) => {
          if (equipmentToStart && onStartLocation) {
            onStartLocation(equipmentToStart, startDate);
          }
          setShowStartModal(false);
          setEquipmentToStart(null);
        }}
        onCancel={() => {
          setShowStartModal(false);
          setEquipmentToStart(null);
        }}
      />

      {/* Modal de retour de location */}
      <ReturnModal
        show={showReturnModal}
        equipment={equipmentToReturn}
        onConfirm={(returnDate, returnNotes) => {
          if (equipmentToReturn && onReturnLocation) {
            onReturnLocation(equipmentToReturn, returnDate, returnNotes);
          }
          setShowReturnModal(false);
          setEquipmentToReturn(null);
        }}
        onCancel={() => {
          setShowReturnModal(false);
          setEquipmentToReturn(null);
        }}
      />

      {/* Modal de création de réservation */}
      <CreateReservationModal
        show={showCreateReservationModal}
        equipment={equipmentToReserve}
        onConfirm={(formData) => {
          if (equipmentToReserve && onCreateReservation) {
            onCreateReservation(equipmentToReserve, formData);
          }
          setShowCreateReservationModal(false);
          setEquipmentToReserve(null);
        }}
        onCancel={() => {
          setShowCreateReservationModal(false);
          setEquipmentToReserve(null);
        }}
      />

      {/* Modal d'échange de matériel */}
      <ExchangeModal
        show={showExchangeModal}
        equipment={equipmentToExchange}
        equipmentData={equipmentData}
        onConfirm={(replacementEquipment) => {
          if (equipmentToExchange) {
            window.dispatchEvent(new CustomEvent('equipment-exchange', {
              detail: {
                currentEquipment: equipmentToExchange,
                replacementEquipment: replacementEquipment
              }
            }));
          }
          setShowExchangeModal(false);
          setEquipmentToExchange(null);
        }}
        onCancel={() => {
          setShowExchangeModal(false);
          setEquipmentToExchange(null);
        }}
      />
    </div>
  );
}

export default EquipmentListView;
