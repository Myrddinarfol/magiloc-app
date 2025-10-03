import { API_URL } from '../config/constants';

// Service pour toutes les opérations API liées aux équipements

export const equipmentService = {
  // Récupérer tous les équipements
  async getAll() {
    const response = await fetch(`${API_URL}/api/equipment`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Créer un nouvel équipement
  async create(equipmentData) {
    const response = await fetch(`${API_URL}/api/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipmentData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Mettre à jour un équipement
  async update(id, updates) {
    const response = await fetch(`${API_URL}/api/equipment/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Effectuer le retour d'un équipement
  async returnEquipment(id, returnData) {
    const response = await fetch(`${API_URL}/api/equipment/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
};
