const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = {
  // Récupérer tous les équipements
  getEquipments: async () => {
    const response = await fetch(`${API_URL}/api/equipment`);
    if (!response.ok) throw new Error('Erreur lors de la récupération');
    return response.json();
  },

  // Ajouter un équipement
  createEquipment: async (equipment) => {
    const response = await fetch(`${API_URL}/api/equipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipment)
    });
    if (!response.ok) throw new Error('Erreur lors de la création');
    return response.json();
  },

  // Mettre à jour un équipement
  updateEquipment: async (id, equipment) => {
    const response = await fetch(`${API_URL}/api/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipment)
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour');
    return response.json();
  },

  // Supprimer un équipement
  deleteEquipment: async (id) => {
    const response = await fetch(`${API_URL}/api/equipment/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return response.json();
  }
};

export default API_URL;