import React, { useState, useMemo, useEffect } from 'react';
import { useUI } from '../hooks/useUI';
import PageHeader from './common/PageHeader';

function EquipmentListView({
  equipmentData,
  currentPage,
  setSelectedEquipment,
  handleOpenEquipmentDetail,
  getStatusClass,
  setShowImporter
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterCMU, setFilterCMU] = useState('');
  const [filterLongueur, setFilterLongueur] = useState('');
  const { equipmentFilter, setEquipmentFilter } = useUI();

  // Auto-reset filter when leaving sur-parc
  useEffect(() => {
    if (currentPage !== 'sur-parc' && equipmentFilter) {
      setEquipmentFilter(null);
    }
  }, [currentPage, equipmentFilter, setEquipmentFilter]);

  // Fonction pour calculer l'état du VGP (identique aux fiches)
  const getVGPStatus = (prochainVGP) => {
    if (!prochainVGP) return { label: '-', class: 'vgp-gray', animated: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const vgpDate = new Date(prochainVGP);
    vgpDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((vgpDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // VGP DÉPASSÉ - Rouge avec animation
      return { label: `${Math.abs(diffDays)}j`, class: 'vgp-red', animated: true };
    } else if (diffDays <= 30) {
      // VGP À PRÉVOIR - Orange avec animation
      return { label: `${diffDays}j`, class: 'vgp-orange', animated: true };
    } else {
      // VGP À JOUR - Vert
      return { label: `${diffDays}j`, class: 'vgp-green', animated: false };
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

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(equipment =>
        equipment.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (equipment.client && equipment.client.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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

      {/* Boutons d'action pour PARC LOC */}
      {currentPage === 'parc-loc' && setShowImporter && (
        <div className="parc-loc-actions">
          <button
            onClick={() => setShowImporter(true)}
            className="btn btn-primary"
          >
            📥 IMPORTER CSV
          </button>
          <button
            onClick={() => {
              // Reset filters
              setSearchTerm('');
              setEquipmentFilter(null);
              setFilterDesignation('');
              setFilterCMU('');
              setFilterLongueur('');
            }}
            className="btn btn-secondary"
          >
            🔄 RÉINITIALISER
          </button>
        </div>
      )}

      {/* Filtres avancés pour SUR PARC et PARC LOC */}
      {(currentPage === 'sur-parc' || currentPage === 'parc-loc') && (
        <div className="filters-container" style={{
          display: 'flex',
          gap: '10px',
          margin: '15px 0',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Filtrer par désignation..."
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '14px',
              minWidth: '180px'
            }}
          />

          <input
            type="text"
            placeholder="Filtrer par CMU..."
            value={filterCMU}
            onChange={(e) => setFilterCMU(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '14px',
              minWidth: '150px'
            }}
          />

          <input
            type="text"
            placeholder="Filtrer par longueur..."
            value={filterLongueur}
            onChange={(e) => setFilterLongueur(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '14px',
              minWidth: '150px'
            }}
          />

          {(filterDesignation || filterCMU || filterLongueur) && (
            <button
              onClick={() => {
                setFilterDesignation('');
                setFilterCMU('');
                setFilterLongueur('');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #dc2626',
                backgroundColor: 'white',
                color: '#dc2626',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ✕ Effacer filtres
            </button>
          )}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher par désignation, modèle, n° série ou client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
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
                          <span className={`vgp-badge ${vgpStatus.class} ${vgpStatus.animated ? 'vgp-pulse' : ''}`}>
                            {vgpStatus.label}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedEquipment(equipment)}
                            className="btn btn-primary btn-sm"
                          >
                            Détails
                          </button>
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
                            <div>
                              <div>Début: {equipment.debutLocation}</div>
                              {equipment.finLocationTheorique && (
                                <div>Fin: {equipment.finLocationTheorique}</div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedEquipment(equipment)}
                            className="btn btn-primary btn-sm"
                          >
                            Détails
                          </button>
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
    </div>
  );
}

export default EquipmentListView;
