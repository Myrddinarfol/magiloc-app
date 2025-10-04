import React from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import { getStatusClass } from '../utils/statusHelpers';
import EquipmentListView from '../components/EquipmentListView';

const MaintenanceListPage = () => {
  const { equipmentData } = useEquipment();
  const { setSelectedEquipment, handleOpenEquipmentDetail } = useUI();

  return (
    <EquipmentListView
      equipmentData={equipmentData}
      currentPage="maintenance"
      setSelectedEquipment={setSelectedEquipment}
      handleOpenEquipmentDetail={handleOpenEquipmentDetail}
      getStatusClass={getStatusClass}
    />
  );
};

export default MaintenanceListPage;
