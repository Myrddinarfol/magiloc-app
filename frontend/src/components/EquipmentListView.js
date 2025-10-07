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
  const { equipmentFilter, setEquipmentFilter } = useUI();

  // Auto-reset filter when leaving sur-parc
  useEffect(() => {
    if (currentPage !== 'sur-parc' && equipmentFilter) {
      setEquipmentFilter(null);
    }
  }, [currentPage, equipmentFilter, setEquipmentFilter]);

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
  }, [equipmentData, currentPage, searchTerm, equipmentFilter]);

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
            }}
            className="btn btn-secondary"
          >
            🔄 RÉINITIALISER
          </button>
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
                <th>Équipement</th>
                <th>N° Série</th>
                <th>Statut</th>
                <th>Client</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((equipment) => (
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
                </tr>
              ))}
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
