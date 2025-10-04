import { useState } from 'react';
import { historyService } from '../services/historyService';
import { useUI } from './useUI';

// Hook personnalisé pour gérer les historiques
export const useHistory = () => {
  const { showToast } = useUI();
  const [locationHistory, setLocationHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  const loadLocationHistory = async (equipmentId, onSuccess) => {
    try {
      const data = await historyService.getLocationHistory(equipmentId);
      setLocationHistory(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ Erreur chargement historique locations:', error);
      showToast('Erreur lors du chargement de l\'historique des locations', 'error');
    }
  };

  const loadMaintenanceHistory = async (equipmentId, onSuccess) => {
    try {
      const data = await historyService.getMaintenanceHistory(equipmentId);
      setMaintenanceHistory(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ Erreur chargement historique maintenance:', error);
      showToast('Erreur lors du chargement de l\'historique de maintenance', 'error');
    }
  };

  return {
    locationHistory,
    maintenanceHistory,
    loadLocationHistory,
    loadMaintenanceHistory
  };
};
