import React from 'react';

function EquipmentListView({ 
  equipmentData, 
  currentPage, 
  searchTerm, 
  setSearchTerm, 
  setSelectedEquipment,
  getStatusClass 
}) {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Tableau de bord';
      case 'parc-loc': return 'Parc Location - Tous les équipements';
      case 'en-location': return 'Équipements en location';
      case 'planning': return 'Planning des locations';
      case 'en-offre': return 'Offres de prix en cours';
      case 'maintenance': return 'Équipements en maintenance';
      default: return 'MagiLoc';
    }
  };

  const getFilteredData = () => {
    let filtered = equipmentData;
    
    switch (currentPage) {
      case 'en-location':
        filtered = equipmentData.filter(eq => eq.statut === 'En Location');
        break;
      case 'en-offre':
        filtered = equipmentData.filter(eq => eq.statut === 'En Offre de Prix');
        break;
      case 'maintenance':
        filtered = equipmentData.filter(eq => eq.statut === 'En Maintenance');
        break;
      default:
        filtered = equipmentData;
    }

    if (searchTerm) {
      filtered = filtered.filter(equipment =>
        equipment.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (equipment.client && equipment.client.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher par désignation, n° série ou client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          autoFocus={false}
        />
      </div>

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