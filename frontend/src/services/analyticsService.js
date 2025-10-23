import { API_URL } from '../config/constants';
import { calculateBusinessDays, convertFrenchToISO } from '../utils/dateHelpers';

/**
 * Service pour tous les calculs analytiques du CA
 */

// Récupérer TOUS les équipements (avec locations actuelles)
export const analyticsService = {
  async getAllEquipmentWithLocations() {
    const response = await fetch(`${API_URL}/api/equipment?limit=10000`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Récupérer tous les historiques de locations d'un équipement
  async getEquipmentLocationHistory(equipmentId) {
    const response = await fetch(`${API_URL}/api/equipment/${equipmentId}/location-history`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  /**
   * Calcule le CA estimatif du mois
   * Inclut: locations clôturées + locations en cours (jusqu'à fin du mois)
   */
  calculateMonthlyEstimatedCA(equipmentList, month, year) {
    let totalCA = 0;
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0); // Dernier jour du mois

    equipmentList.forEach(equipment => {
      // Location en cours
      if (equipment.statut === 'En Location' && equipment.debutLocation && equipment.finLocationTheorique) {
        const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));
        const locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));

        // Intersect avec le mois
        const rangeStart = new Date(Math.max(locationStart, monthStart));
        const rangeEnd = new Date(Math.min(locationEnd, monthEnd));

        if (rangeStart <= rangeEnd) {
          const businessDays = calculateBusinessDays(
            rangeStart.toISOString().split('T')[0],
            rangeEnd.toISOString().split('T')[0]
          );

          const prixHT = equipment.prixHT || 0;
          const isLongDuration = businessDays >= 21;
          let ca = businessDays * prixHT;

          if (isLongDuration) {
            ca = ca * 0.8; // Remise 20%
          }

          // Appliquer minimum facturation si nécessaire
          if (equipment.minimumFacturationApply && ca < equipment.minimumFacturation) {
            ca = equipment.minimumFacturation;
          }

          totalCA += ca;
        }
      }
    });

    return parseFloat(totalCA.toFixed(2));
  },

  /**
   * Calcule le CA confirmé du mois
   * Inclut: locations clôturées + locations en cours (uniquement jours écoulés)
   */
  calculateMonthlyConfirmedCA(equipmentList, month, year) {
    let totalCA = 0;
    const today = new Date();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    equipmentList.forEach(equipment => {
      // Location en cours - jours déjà écoulés
      if (equipment.statut === 'En Location' && equipment.debutLocation) {
        const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));

        // On prend jusqu'à aujourd'hui (ou fin théorique si avant aujourd'hui)
        const locationEnd = equipment.finLocationTheorique
          ? new Date(convertFrenchToISO(equipment.finLocationTheorique))
          : today;

        const realEnd = new Date(Math.min(today, locationEnd));

        // Intersect avec le mois
        const rangeStart = new Date(Math.max(locationStart, monthStart));
        const rangeEnd = new Date(Math.min(realEnd, monthEnd));

        if (rangeStart <= rangeEnd) {
          const businessDays = calculateBusinessDays(
            rangeStart.toISOString().split('T')[0],
            rangeEnd.toISOString().split('T')[0]
          );

          const prixHT = equipment.prixHT || 0;
          const isLongDuration = businessDays >= 21;
          let ca = businessDays * prixHT;

          if (isLongDuration) {
            ca = ca * 0.8; // Remise 20%
          }

          // Appliquer minimum facturation si nécessaire
          if (equipment.minimumFacturationApply && ca < equipment.minimumFacturation) {
            ca = equipment.minimumFacturation;
          }

          totalCA += ca;
        }
      }
    });

    return parseFloat(totalCA.toFixed(2));
  },

  /**
   * Calcule le CA pour un mois/année basé sur l'historique
   * (pour les mois passés)
   */
  calculateHistoricalMonthlyCA(locationHistory, month, year) {
    let totalCA = 0;
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    locationHistory.forEach(location => {
      if (location.ca_total_ht) {
        const returnDate = new Date(location.date_retour_reel || location.rentre_le);

        // La location a été clôturée ce mois-ci
        if (returnDate >= monthStart && returnDate <= monthEnd) {
          totalCA += parseFloat(location.ca_total_ht);
        }
      }
    });

    return parseFloat(totalCA.toFixed(2));
  },

  /**
   * Récupère les données de CA pour tous les mois (historique)
   * Limite à l'année en cours et précédente
   */
  async getAllMonthsCAData(equipmentList) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const caData = {};

    // Récupère l'historique pour tous les équipements
    const allHistory = [];
    for (const equipment of equipmentList) {
      try {
        const history = await this.getEquipmentLocationHistory(equipment.id);
        allHistory.push(...history);
      } catch (error) {
        console.warn(`Erreur historique équipement ${equipment.id}:`, error);
      }
    }

    // Parcourt tous les mois depuis le début de l'année précédente
    for (let year = currentYear - 1; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(year, month);

        // Ne pas aller dans le futur
        if (monthDate > today) break;

        const key = `${year}-${String(month + 1).padStart(2, '0')}`;

        if (month === currentMonth && year === currentYear) {
          // Mois actuel: combiner historique + locations en cours
          const historicalCA = this.calculateHistoricalMonthlyCA(allHistory, month, year);
          const estimatedCA = this.calculateMonthlyEstimatedCA(equipmentList, month, year);
          const confirmedCA = this.calculateMonthlyConfirmedCA(equipmentList, month, year);

          caData[key] = {
            estimatedCA: estimatedCA,
            confirmedCA: confirmedCA,
            isCurrent: true,
            month: month,
            year: year
          };
        } else {
          // Mois passés: uniquement historique
          const historicalCA = this.calculateHistoricalMonthlyCA(allHistory, month, year);

          caData[key] = {
            historicalCA: historicalCA,
            isCurrent: false,
            month: month,
            year: year
          };
        }
      }
    }

    return caData;
  },

  /**
   * Retourne les stats enrichies pour les KPIs
   */
  calculateMonthStats(equipmentList, month, year) {
    const estimatedCA = this.calculateMonthlyEstimatedCA(equipmentList, month, year);
    const confirmedCA = this.calculateMonthlyConfirmedCA(equipmentList, month, year);

    // Compteurs de locations
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    let activeLocations = 0;
    let totalDays = 0;

    equipmentList.forEach(equipment => {
      if (equipment.statut === 'En Location' && equipment.debutLocation && equipment.finLocationTheorique) {
        const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));
        const locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));

        if (locationStart <= monthEnd && locationEnd >= monthStart) {
          activeLocations++;

          const rangeStart = new Date(Math.max(locationStart, monthStart));
          const rangeEnd = new Date(Math.min(locationEnd, monthEnd));

          const businessDays = calculateBusinessDays(
            rangeStart.toISOString().split('T')[0],
            rangeEnd.toISOString().split('T')[0]
          );

          totalDays += businessDays;
        }
      }
    });

    const avgDaysPerLocation = activeLocations > 0 ? Math.round(totalDays / activeLocations) : 0;

    return {
      estimatedCA,
      confirmedCA,
      activeLocations,
      avgDaysPerLocation
    };
  }
};

export default analyticsService;
