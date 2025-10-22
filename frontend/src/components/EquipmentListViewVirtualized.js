/**
 * Version virtualisée d'EquipmentListView
 *
 * Utilise react-window FixedSizeList pour améliorer la performance
 * avec des listes de 500+ équipements
 *
 * Import: import EquipmentListViewVirtualized from './EquipmentListViewVirtualized';
 * Usage: <EquipmentListViewVirtualized {...props} />
 */

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import './EquipmentListView.css';

/**
 * Composant de ligne virtualisée pour la liste d'équipements
 */
const EquipmentRowVirtual = ({
  index,
  style,
  data: {
    filteredData,
    getStatusClass,
    handleOpenEquipmentDetail,
    onCancelReservation,
    onCreateReservation,
    onReturnLocation,
    onStartLocation
  }
}) => {
  const equipment = filteredData[index];

  if (!equipment) return null;

  return (
    <div style={style} className="equipment-table-row-virtual">
      <table className="equipment-table-virtual" style={{ width: '100%' }}>
        <tbody>
          <tr
            key={equipment.id}
            style={{
              backgroundColor: index % 2 === 0 ? '#1a202c' : '#111827',
              borderBottom: '1px solid #2d3748'
            }}
            onClick={() => handleOpenEquipmentDetail && handleOpenEquipmentDetail(equipment)}
            className="equipment-row-interactive"
          >
            <td>{equipment.id}</td>
            <td className="cell-designation" title={equipment.designation}>
              {equipment.designation}
            </td>
            <td>{equipment.cmu}</td>
            <td>{equipment.modele}</td>
            <td>{equipment.etat}</td>
            <td>
              <span className={`badge ${getStatusClass(equipment.statut)}`}>
                {equipment.statut}
              </span>
            </td>
            <td>{equipment.client || '—'}</td>
            <td>{equipment.debutLocation || '—'}</td>
            <td>
              <div className="action-buttons-compact">
                {equipment.statut === 'En Location' && (
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReturnLocation && onReturnLocation(equipment);
                    }}
                    title="Effectuer le retour"
                  >
                    ↩️
                  </button>
                )}
                {equipment.statut === 'Sur Parc' && (
                  <>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartLocation && onStartLocation(equipment);
                      }}
                      title="Démarrer une location"
                    >
                      ▶
                    </button>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateReservation && onCreateReservation(equipment);
                      }}
                      title="Créer une réservation"
                    >
                      📋
                    </button>
                  </>
                )}
                {equipment.statut === 'En Réservation' && (
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelReservation && onCancelReservation(equipment);
                    }}
                    title="Annuler la réservation"
                  >
                    ❌
                  </button>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/**
 * Composant EquipmentListViewVirtualized
 *
 * Props identiques à EquipmentListView mais utilise virtualization
 */
const EquipmentListViewVirtualized = ({
  equipmentData = [],
  currentPage = 1,
  setSelectedEquipment,
  handleOpenEquipmentDetail,
  getStatusClass,
  setShowImporter,
  setShowAddEquipmentModal,
  onCancelReservation,
  onCreateReservation,
  onReturnLocation,
  onStartLocation,
  searchTerm = '',
  equipmentFilter = 'all',
  filterDesignation = '',
  filterCMU = '',
  filterLongueur = ''
}) => {
  // Filtrer les données comme dans EquipmentListView
  const filteredData = useMemo(() => {
    let filtered = equipmentData;

    // Filtrer par type
    if (equipmentFilter !== 'all') {
      filtered = filtered.filter((eq) => eq.statut === equipmentFilter);
    }

    // Filtrer par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (eq) =>
          eq.designation?.toLowerCase().includes(search) ||
          eq.cmu?.toLowerCase().includes(search) ||
          eq.modele?.toLowerCase().includes(search) ||
          eq.numeroSerie?.toLowerCase().includes(search)
      );
    }

    // Filtrer par désignation
    if (filterDesignation) {
      filtered = filtered.filter((eq) =>
        eq.designation?.toLowerCase().includes(filterDesignation.toLowerCase())
      );
    }

    // Filtrer par CMU
    if (filterCMU) {
      filtered = filtered.filter((eq) =>
        eq.cmu?.toLowerCase().includes(filterCMU.toLowerCase())
      );
    }

    // Filtrer par longueur
    if (filterLongueur) {
      filtered = filtered.filter((eq) =>
        eq.longueur?.toLowerCase().includes(filterLongueur.toLowerCase())
      );
    }

    return filtered;
  }, [
    equipmentData,
    equipmentFilter,
    searchTerm,
    filterDesignation,
    filterCMU,
    filterLongueur
  ]);

  const itemHeight = 56; // Hauteur d'une ligne (compatible avec le CSS existant)
  const containerHeight = 600; // Hauteur du conteneur virtualisé

  if (filteredData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
        Aucun équipement trouvé
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: containerHeight, border: '1px solid #2d3748', borderRadius: '8px' }}>
      {/* En-têtes */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#1a202c',
          borderBottom: '2px solid #374151'
        }}
      >
        <table className="equipment-table-virtual" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Désignation</th>
              <th>CMU</th>
              <th>Modèle</th>
              <th>État</th>
              <th>Statut</th>
              <th>Client</th>
              <th>Début</th>
              <th>Actions</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Liste virtualisée */}
      <List
        height={containerHeight - 50} // Soustraire la hauteur de l'en-tête
        itemCount={filteredData.length}
        itemSize={itemHeight}
        width="100%"
        itemData={{
          filteredData,
          getStatusClass,
          handleOpenEquipmentDetail,
          onCancelReservation,
          onCreateReservation,
          onReturnLocation,
          onStartLocation
        }}
      >
        {EquipmentRowVirtual}
      </List>
    </div>
  );
};

export default EquipmentListViewVirtualized;
