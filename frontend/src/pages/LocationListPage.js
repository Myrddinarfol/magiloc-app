import React from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import { getStatusClass } from '../utils/statusHelpers';
import EquipmentListView from '../components/EquipmentListView';

const LocationListPage = () => {
  const { equipmentData } = useEquipment();
  const { setSelectedEquipment, handleOpenEquipmentDetail } = useUI();

  return (
    <EquipmentListView
      equipmentData={equipmentData}
      currentPage="location-list"
      setSelectedEquipment={setSelectedEquipment}
      handleOpenEquipmentDetail={handleOpenEquipmentDetail}
      getStatusClass={getStatusClass}
    />
  );
};

export default LocationListPage;
