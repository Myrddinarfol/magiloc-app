import React, { useState, useMemo, useEffect } from 'react';
import { useUI } from '../hooks/useUI';

function EquipmentListView({ equipmentData, currentPage, setSelectedEquipment, handleOpenEquipmentDetail, getStatusClass, setShowImporter, handleResetData, setShowAddEquipmentModal }) {
  const { equipmentFilter, setEquipmentFilter } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterCMU, setFilterCMU] = useState('');
  const [filterLongueur, setFilterLongueur] = useState('');

  // Réinitialiser les filtres locaux quand on change de page (sauf si on a un filtre de modèles)
  useEffect(() => {
    if (!equipmentFilter) {
      setSearchTerm('');
      setFilterDesignation('');
      setFilterCMU('');
      setFilterLongueur('');
    }
  }, [currentPage, equipmentFilter]);

  // Fonction pour calculer l'indicateur VGP avec texte détaillé
  const getVGPIndicator = (prochainVGP) => {
    if (!prochainVGP) return {
      color: 'gray',
      label: 'Non renseigné',
      icon: '❓',
      subLabel: '',
      days: 0
    };

    const today = new Date();
    const vgpDate = new Date(prochainVGP.split('/').reverse().join('-')); // Conversion DD/MM/YYYY -> YYYY-MM-DD
    const diffTime = vgpDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        color: 'red',
        label: 'VGP DÉPASSÉ',
        icon: '⚠️',
        subLabel: `Dépassé de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`,
        days: diffDays
      };
    } else if (diffDays <= 30) {
      return {
        color: 'orange',
        label: 'VGP À PRÉVOIR',
        icon: '❗',
        subLabel: `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`,
        days: diffDays
      };
    } else {
      return {
        color: 'green',
        label: 'VGP À JOUR',
        icon: '✓',
        subLabel: `Dans ${diffDays} jours`,
        days: diffDays
      };
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Tableau de bord';
      case 'sur-parc': return 'Sur Parc - Équipements disponibles';
      case 'parc-loc': return 'Parc Location - Tous les équipements';
      case 'en-location':
      case 'location-list': return 'Équipements en location';
      case 'planning': return 'Planning des locations';
      case 'en-offre': return 'Réservations en cours';
      case 'maintenance': return 'Équipements en maintenance';
      default: return 'MagiLoc';
    }
  };

  // Extraction des valeurs uniques pour les filtres (PARC LOC uniquement)
  const uniqueDesignations = useMemo(() => {
    const designations = [...new Set(equipmentData.map(eq => eq.designation).filter(Boolean))];
    return designations.sort();
  }, [equipmentData]);

  const uniqueCMUs = useMemo(() => {
    const cmus = [...new Set(equipmentData.map(eq => eq.cmu).filter(Boolean))];
    return cmus.sort();
  }, [equipmentData]);

  const uniqueLongueurs = useMemo(() => {
    const longueurs = [...new Set(equipmentData.map(eq => eq.longueur).filter(Boolean))];
    return longueurs.sort();
  }, [equipmentData]);

  // Optimisation : filtrage mémorisé
  const filteredData = useMemo(() => {
    let filtered = equipmentData;

    switch (currentPage) {
      case 'sur-parc':
        filtered = equipmentData.filter(eq => eq.statut === 'Sur Parc');
        break;
      case 'en-location':
      case 'location-list':
        filtered = equipmentData.filter(eq => eq.statut === 'En Location');
        break;
      case 'en-offre':
        filtered = equipmentData.filter(eq => eq.statut === 'En Réservation');
        break;
      case 'maintenance':
        filtered = equipmentData.filter(eq => eq.statut === 'En Maintenance');
        break;
      default:
        filtered = equipmentData;
    }

    // Filtre global de modèles (depuis produits phares)
    if (equipmentFilter && equipmentFilter.models && equipmentFilter.models.length > 0) {
      filtered = filtered.filter(eq =>
        equipmentFilter.models.some(model =>
          eq.modele && eq.modele.toUpperCase().includes(model.toUpperCase())
        )
      );
    }

    // Filtres spécifiques PARC LOC et SUR PARC
    if (currentPage === 'parc-loc' || currentPage === 'sur-parc') {
      if (filterDesignation) {
        filtered = filtered.filter(eq => eq.designation === filterDesignation);
      }
      if (filterCMU) {
        filtered = filtered.filter(eq => eq.cmu === filterCMU);
      }
      if (filterLongueur) {
        filtered = filtered.filter(eq => eq.longueur === filterLongueur);
      }
    }

    // Recherche textuelle intelligente multi-champs
    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/); // Sépare les mots

      filtered = filtered.filter(equipment => {
        // Concatène tous les champs pertinents en une seule chaîne
        const searchableText = [
          equipment.designation,
          equipment.cmu,
          equipment.modele,
          equipment.marque,
          equipment.longueur,
          equipment.numeroSerie,
          equipment.client,
          equipment.etat
        ]
          .filter(Boolean) // Retire les valeurs null/undefined
          .join(' ')
          .toLowerCase();

        // Vérifie que TOUS les mots de recherche sont présents
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    return filtered;
  }, [equipmentData, currentPage, searchTerm, filterDesignation, filterCMU, filterLongueur, equipmentFilter]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{getPageTitle()}</h1>
        {equipmentFilter && equipmentFilter.models && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔍 Filtre: {equipmentFilter.models.join(', ')}
            </span>
            <button
              onClick={() => setEquipmentFilter(null)}
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              ✕ Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Layout spécial pour PARC LOC : filtres à gauche (50%) + boutons de gestion à droite (50%) */}
      {currentPage === 'parc-loc' ? (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
          {/* Partie gauche : Filtres et recherche (50%) */}
          <div style={{
            flex: '1',
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
            position: 'relative',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(220, 38, 38, 0.2)'
          }}>
            <div style={{
              content: '',
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              right: '-3px',
              bottom: '-3px',
              background: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
              borderRadius: '12px',
              zIndex: '-1'
            }}></div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Recherche intelligente : ex. 'palan manuel 1t 10m'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="filter-designation">Désignation :</label>
                <select
                  id="filter-designation"
                  value={filterDesignation}
                  onChange={(e) => setFilterDesignation(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Toutes les désignations</option>
                  {uniqueDesignations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-cmu">CMU :</label>
                <select
                  id="filter-cmu"
                  value={filterCMU}
                  onChange={(e) => setFilterCMU(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tous les CMU</option>
                  {uniqueCMUs.map(cmu => (
                    <option key={cmu} value={cmu}>{cmu}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-longueur">Longueur :</label>
                <select
                  id="filter-longueur"
                  value={filterLongueur}
                  onChange={(e) => setFilterLongueur(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Toutes les longueurs</option>
                  {uniqueLongueurs.map(longueur => (
                    <option key={longueur} value={longueur}>{longueur}</option>
                  ))}
                </select>
              </div>

              {(filterDesignation || filterCMU || filterLongueur) && (
                <button
                  onClick={() => {
                    setFilterDesignation('');
                    setFilterCMU('');
                    setFilterLongueur('');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  🔄 Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Partie droite : Boutons de gestion (50%) */}
          <div style={{
            flex: '1',
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
            position: 'relative',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(220, 38, 38, 0.2)',
            alignItems: 'center'
          }}>
            <div style={{
              content: '',
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              right: '-3px',
              bottom: '-3px',
              background: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
              borderRadius: '12px',
              zIndex: '-1'
            }}></div>

            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '16px', fontWeight: 'bold' }}>
              🛠️ Gestion du Parc
            </h3>

            <button
              onClick={() => setShowImporter(true)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                width: '200px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              📂 IMPORTER CSV
            </button>

            <button
              onClick={handleResetData}
              className="btn btn-danger"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                width: '200px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🔄 RÉINITIALISER
            </button>

            <button
              onClick={() => setShowAddEquipmentModal(true)}
              className="btn btn-success"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                width: '200px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              ➕ AJOUTER
            </button>
          </div>
        </div>
      ) : (
        /* Layout normal pour les autres pages */
        <>
          <div className="search-container">
            <input
              type="text"
              placeholder="Recherche intelligente : ex. 'palan manuel 1t 10m'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filtres pour SUR PARC */}
          {currentPage === 'sur-parc' && (
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="filter-designation">Désignation :</label>
                <select
                  id="filter-designation"
                  value={filterDesignation}
                  onChange={(e) => setFilterDesignation(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Toutes les désignations</option>
                  {uniqueDesignations.map(designation => (
                    <option key={designation} value={designation}>{designation}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-cmu">CMU :</label>
                <select
                  id="filter-cmu"
                  value={filterCMU}
                  onChange={(e) => setFilterCMU(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tous les CMU</option>
                  {uniqueCMUs.map(cmu => (
                    <option key={cmu} value={cmu}>{cmu}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-longueur">Longueur :</label>
                <select
                  id="filter-longueur"
                  value={filterLongueur}
                  onChange={(e) => setFilterLongueur(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Toutes les longueurs</option>
                  {uniqueLongueurs.map(longueur => (
                    <option key={longueur} value={longueur}>{longueur}</option>
                  ))}
                </select>
              </div>

              {(filterDesignation || filterCMU || filterLongueur) && (
                <button
                  onClick={() => {
                    setFilterDesignation('');
                    setFilterCMU('');
                    setFilterLongueur('');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  🔄 Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="table-container">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Équipement</th>
                <th>N° Série</th>
                <th>Statut</th>
                {/* Colonnes spécifiques PARC LOC et SUR PARC */}
                {(currentPage === 'parc-loc' || currentPage === 'sur-parc') && (
                  <>
                    <th>Longueur</th>
                    <th>État</th>
                    <th>Prochain VGP</th>
                  </>
                )}
                {/* Colonnes pour En Location et En Offre */}
                {(currentPage === 'en-location' || currentPage === 'location-list' || currentPage === 'en-offre') && (
                  <>
                    <th>Client</th>
                    <th>Dates</th>
                  </>
                )}
                {/* Colonnes pour Maintenance */}
                {currentPage === 'maintenance' && (
                  <>
                    <th>Longueur</th>
                    <th>Dernier client</th>
                    <th>Motif maintenance</th>
                  </>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((equipment) => {
                const vgpIndicator = getVGPIndicator(equipment.prochainVGP);

                return (
                  <tr key={equipment.id}>
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

                    {/* Colonnes PARC LOC et SUR PARC */}
                    {(currentPage === 'parc-loc' || currentPage === 'sur-parc') && (
                      <>
                        <td>{equipment.longueur || '-'}</td>
                        <td>
                          <span className={`etat-badge etat-${equipment.etat?.toLowerCase()}`}>
                            {equipment.etat || '-'}
                          </span>
                        </td>
                        <td>
                          <div className={`vgp-table-badge vgp-table-${vgpIndicator.color}`}>
                            <div className="vgp-table-icon">{vgpIndicator.icon}</div>
                            <div className="vgp-table-content">
                              <div className="vgp-table-label">{vgpIndicator.label}</div>
                              <div className="vgp-table-date">{equipment.prochainVGP || 'N/A'}</div>
                              {vgpIndicator.subLabel && (
                                <div className="vgp-table-sublabel">{vgpIndicator.subLabel}</div>
                              )}
                            </div>
                          </div>
                        </td>
                      </>
                    )}

                    {/* Colonnes En Location / En Offre */}
                    {(currentPage === 'en-location' || currentPage === 'location-list' || currentPage === 'en-offre') && (
                      <>
                        <td>{equipment.client || '-'}</td>
                        <td>
                          {equipment.debutLocation && (
                            <div>
                              <div>Début: {equipment.debutLocation}</div>
                              {equipment.finLocationTheorique && (
                                <div>Fin: {equipment.finLocationTheorique}</div>
                              )}
                            </div>
                          )}
                        </td>
                      </>
                    )}

                    {/* Colonnes Maintenance */}
                    {currentPage === 'maintenance' && (
                      <>
                        <td>{equipment.longueur || '-'}</td>
                        <td>
                          <span className="last-client">
                            {equipment.dernierClient || '-'}
                          </span>
                        </td>
                        <td>
                          <span className="maintenance-motif">
                            {equipment.motifMaintenance || '-'}
                          </span>
                        </td>
                      </>
                    )}

                    <td>
                      <button
                        onClick={() => handleOpenEquipmentDetail(equipment, currentPage)}
                        className="btn btn-primary btn-sm"
                      >
                        Détails
                      </button>
                    </td>
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
    </div>
  );
}

export default EquipmentListView;
