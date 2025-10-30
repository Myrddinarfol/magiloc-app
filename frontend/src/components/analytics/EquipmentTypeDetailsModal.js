import React, { useMemo } from 'react';
import './EquipmentTypeDetailsModal.css';

const EquipmentTypeDetailsModal = ({ isOpen, onClose, equipmentType, pieChartMode, month, year, locationData, equipmentData }) => {
  console.log('🎯 MODAL RENDER - isOpen:', isOpen, 'type:', equipmentType);

  // Calculer les données du tableau
  const tableData = useMemo(() => {
    if (!equipmentData || !locationData) {
      console.log('❌ Modal: Pas de données - equipmentData:', !!equipmentData, 'locationData:', !!locationData);
      return [];
    }

    console.log('📊 Modal - equipmentType:', equipmentType);
    console.log('📊 Modal - locationData length:', locationData.length);
    console.log('📊 Modal - Premier location:', locationData[0]);

    // Filtrer les locations du type sélectionné ET du mois/année sélectionné
    const typeLocations = locationData.filter(loc => {
      const designation = loc.designation || loc.equipmentType || '';
      const matches = designation.includes(equipmentType);

      // Vérifier que la location chevauche le mois/année sélectionné
      const startDate = new Date(loc.startDate || loc.debutLocation || '');
      const endDate = new Date(loc.endDate || loc.finLocationTheorique || loc.finLocation || '');

      let isInPeriod = false;
      if (pieChartMode === 'month') {
        // Vérifier si la location chevauche le mois sélectionné
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        isInPeriod = !(endDate < monthStart || startDate > monthEnd);
      } else {
        // Vérifier si la location chevauche l'année sélectionnée
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);
        isInPeriod = !(endDate < yearStart || startDate > yearEnd);
      }

      return matches && isInPeriod;
    });

    console.log('🔧 Locations filtrées pour', equipmentType, ':', typeLocations.length);
    if (typeLocations.length > 0) {
      console.log('📍 Premier location filtrée:', JSON.stringify(typeLocations[0]));
      console.log('📍 Clés dispo dans location:', Object.keys(typeLocations[0]));
    }

    // Récupérer les IDs uniques des équipements avec locations
    const equipmentIds = [...new Set(typeLocations.map(loc => loc.equipment_id || loc.id || loc.equipmentId))];
    console.log('🆔 Equipment IDs trouvés:', equipmentIds);
    console.log('📊 equipmentData disponible:', equipmentData.length, 'premier:', equipmentData[0]?.id);

    // Pour chaque équipement, créer une ligne avec les infos
    const rows = equipmentIds.map(eqId => {
      const equipment = equipmentData.find(e => e.id === eqId);
      console.log('🔍 Equipement trouvé pour ID', eqId, ':', equipment?.cmu);
      const eqLocations = typeLocations.filter(loc => loc.equipment_id === eqId);

      // Calculs
      const daysUsed = eqLocations.reduce((sum, loc) => sum + (loc.businessDaysThisMonth || 0), 0);
      const daysInMonth = pieChartMode === 'month' ? new Date(year, month + 1, 0).getDate() : 365;
      const utilizationRate = daysInMonth > 0 ? Math.round((daysUsed / daysInMonth) * 100) : 0;
      const ca = eqLocations.reduce((sum, loc) => sum + (loc.ca || loc.caThisMonth || 0), 0);

      return {
        equipment,
        daysUsed,
        utilizationRate,
        ca,
        locationsCount: eqLocations.length
      };
    });

    return rows;
  }, [equipmentData, locationData, equipmentType, pieChartMode, month, year]);

  if (!isOpen) return null;

  const timeLabel = pieChartMode === 'month'
    ? new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : year;

  return (
    <div className="equipment-details-overlay" onClick={onClose}>
      <div className="equipment-details-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="equipment-details-header">
          <div className="equipment-details-title-section">
            <h2 className="equipment-details-title">🔧 {equipmentType}</h2>
            <p className="equipment-details-period">Période: {timeLabel}</p>
          </div>
          <button className="equipment-details-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="equipment-details-content">
          {tableData.length === 0 ? (
            <div className="no-data-message">Aucun équipement loué cette période</div>
          ) : (
            <div className="table-wrapper">
              <table className="equipment-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>N° Série</th>
                    <th>Marque</th>
                    <th>Modèle</th>
                    <th>État</th>
                    <th>Statut</th>
                    <th>Jours loués</th>
                    <th>Utilisation</th>
                    <th>CA</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="ref-cell">{row.equipment?.cmu || row.equipment?.id || 'N/A'}</td>
                      <td>{row.equipment?.numerSerie || row.equipment?.num_serie || '-'}</td>
                      <td>{row.equipment?.marque || '-'}</td>
                      <td>{row.equipment?.modele || '-'}</td>
                      <td>
                        <span className={`state-badge state-${(row.equipment?.etat || 'bon').toLowerCase()}`}>
                          {row.equipment?.etat || 'Bon'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${(row.equipment?.statut || 'disponible').toLowerCase().replace(/\s+/g, '-')}`}>
                          {row.equipment?.statut || 'Disponible'}
                        </span>
                      </td>
                      <td className="number-cell">{row.daysUsed}</td>
                      <td className="number-cell">{row.utilizationRate}%</td>
                      <td className="ca-cell">
                        💰 {row.ca.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentTypeDetailsModal;
