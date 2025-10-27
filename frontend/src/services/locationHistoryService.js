import { API_URL } from '../config/constants';

export const locationHistoryService = {
  /**
   * Récupère tous les historiques de location sans tarif
   */
  async getMissingPrices() {
    try {
      const response = await fetch(`${API_URL}/api/location-history/missing-prices`);
      if (!response.ok) throw new Error('Erreur récupération tarifs manquants');
      return response.json();
    } catch (error) {
      console.error('❌ Erreur getMissingPrices:', error);
      throw error;
    }
  },

  /**
   * Met à jour le tarif d'un historique de location
   */
  async updatePrice(locationId, prix_ht_jour) {
    try {
      const response = await fetch(
        `${API_URL}/api/location-history/${locationId}/update-price`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prix_ht_jour: parseFloat(prix_ht_jour) })
        }
      );
      if (!response.ok) throw new Error('Erreur mise à jour tarif');
      return response.json();
    } catch (error) {
      console.error('❌ Erreur updatePrice:', error);
      throw error;
    }
  },

  /**
   * Remplit automatiquement les tarifs manquants
   */
  async autoFillPrices() {
    try {
      const response = await fetch(
        `${API_URL}/api/location-history/auto-fill-prices`,
        { method: 'PATCH' }
      );
      if (!response.ok) throw new Error('Erreur remplissage automatique');
      return response.json();
    } catch (error) {
      console.error('❌ Erreur autoFillPrices:', error);
      throw error;
    }
  }
};

export default locationHistoryService;
