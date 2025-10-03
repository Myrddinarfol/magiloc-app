import { API_URL } from '../config/constants';

// Service pour les historiques de location et maintenance

export const historyService = {
  // Récupérer l'historique des locations d'un équipement
  async getLocationHistory(equipmentId) {
    const response = await fetch(`${API_URL}/api/equipment/${equipmentId}/location-history`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Récupérer l'historique de maintenance d'un équipement
  async getMaintenanceHistory(equipmentId) {
    const response = await fetch(`${API_URL}/api/equipment/${equipmentId}/maintenance-history`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
};
