/**
 * Composant pour afficher une liste virtualisée d'équipements
 * Améliore la performance pour listes longues (500+ items)
 *
 * Utilise react-window FixedSizeList
 * - Render uniquement les items visibles
 * - Scroll très fluide
 * - Mémoire optimisée
 */

import React from 'react';
import { FixedSizeList as List } from 'react-window';

/**
 * Wrapper pour la ligne équipement
 */
const EquipmentRow = ({ index, style, data }) => {
  const { items, onSelectEquipment } = data;
  const equipment = items[index];

  if (!equipment) return null;

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid #2d3748',
        backgroundColor: index % 2 === 0 ? '#1a202c' : '#111827',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      className="virtualized-equipment-row"
      onClick={() => onSelectEquipment && onSelectEquipment(equipment)}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d3748'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#1a202c' : '#111827'}
    >
      {/* ID */}
      <div style={{ width: '60px', minWidth: '60px', color: '#9ca3af', fontSize: '12px' }}>
        #{equipment.id}
      </div>

      {/* Designation */}
      <div
        style={{
          flex: 1,
          minWidth: '200px',
          color: '#fff',
          fontWeight: '500',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {equipment.designation}
      </div>

      {/* CMU */}
      <div style={{ width: '80px', minWidth: '80px', color: '#d1d5db', fontSize: '12px' }}>
        {equipment.cmu}
      </div>

      {/* Status Badge */}
      <div
        style={{
          width: '120px',
          minWidth: '120px',
          marginRight: '8px'
        }}
      >
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-block',
            backgroundColor:
              equipment.statut === 'En Location'
                ? '#f97316'
                : equipment.statut === 'Sur Parc'
                ? '#14b8a6'
                : equipment.statut === 'En Réservation'
                ? '#8b5cf6'
                : equipment.statut === 'En Maintenance'
                ? '#f59e0b'
                : '#6b7280',
            color: '#fff'
          }}
        >
          {equipment.statut || 'Unknown'}
        </span>
      </div>

      {/* Client */}
      <div
        style={{
          width: '150px',
          minWidth: '150px',
          color: '#d1d5db',
          fontSize: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {equipment.client || '—'}
      </div>
    </div>
  );
};

/**
 * Composant principal VirtualizedEquipmentList
 *
 * Props:
 * - items: Array d'équipements
 * - itemHeight: Hauteur de chaque ligne (défaut: 60px)
 * - height: Hauteur totale du conteneur
 * - width: Largeur du conteneur
 * - onSelectEquipment: Callback quand on clique sur un équipement
 * - isLoading: Afficher un état de chargement
 */
export const VirtualizedEquipmentList = ({
  items = [],
  itemHeight = 60,
  height = 600,
  width = '100%',
  onSelectEquipment,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
        Chargement...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
        Aucun équipement trouvé
      </div>
    );
  }

  // Utiliser 100% de la largeur disponible
  const listWidth = typeof width === 'string' ? '100%' : width;

  return (
    <div
      style={{
        width: listWidth,
        height: typeof height === 'string' ? height : `${height}px`,
        border: '1px solid #2d3748',
        borderRadius: '8px',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: '60px'
      }}
    >
      <List
        height={typeof height === 'string' ? 600 : height}
        itemCount={items.length}
        itemSize={itemHeight}
        width={listWidth}
        itemData={{ items, onSelectEquipment }}
      >
        {EquipmentRow}
      </List>
    </div>
  );
};

export default VirtualizedEquipmentList;
