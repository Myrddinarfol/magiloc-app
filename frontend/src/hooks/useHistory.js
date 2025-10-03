import { useState } from 'react';
import { historyService } from '../services/historyService';

// Hook personnalisé pour gérer les historiques
export const useHistory = () => {
  const [locationHistory, setLocationHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  const loadLocationHistory = async (equipmentId, onSuccess) => {
    try {
      const data = await historyService.getLocationHistory(equipmentId);
      setLocationHistory(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ Erreur chargement historique locations:', error);
      alert('Erreur lors du chargement de l\'historique des locations');
    }
  };

  const loadMaintenanceHistory = async (equipmentId, onSuccess) => {
    try {
      const data = await historyService.getMaintenanceHistory(equipmentId);
      setMaintenanceHistory(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('❌ Erreur chargement historique maintenance:', error);
      alert('Erreur lors du chargement de l\'historique de maintenance');
    }
  };

  return {
    locationHistory,
    maintenanceHistory,
    loadLocationHistory,
    loadMaintenanceHistory
  };
};
