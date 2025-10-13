import React from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import { getStatusClass } from '../utils/statusHelpers';
import { equipmentService } from '../services/equipmentService';
import EquipmentListView from '../components/EquipmentListView';

const LocationListPage = () => {
  const { equipmentData, loadEquipments } = useEquipment();
  const { setSelectedEquipment, handleOpenEquipmentDetail, showToast } = useUI();

  // Gestionnaire de retour de location
  const handleReturnLocation = async (equipment, returnDate, returnNotes) => {
    if (!equipment || !returnDate) return;

    try {
      const returnData = {
        rentreeLe: returnDate,
        noteRetour: returnNotes || ''
      };

      await equipmentService.returnEquipment(equipment.id, returnData);

      showToast('Retour effectué avec succès ! Le matériel est en maintenance.', 'success');
      await loadEquipments();
    } catch (error) {
      console.error('❌ Erreur retour location:', error);
      showToast(`Erreur lors du retour: ${error.message}`, 'error');
    }
  };

  return (
    <EquipmentListView
      equipmentData={equipmentData}
      currentPage="location-list"
      setSelectedEquipment={setSelectedEquipment}
      handleOpenEquipmentDetail={handleOpenEquipmentDetail}
      getStatusClass={getStatusClass}
      onReturnLocation={handleReturnLocation}
    />
  );
};

export default LocationListPage;
