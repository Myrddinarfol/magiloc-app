import { API_URL } from '../config/constants';
import { calculateBusinessDays, convertFrenchToISO } from '../utils/dateHelpers';

/**
 * Service pour tous les calculs analytiques du CA
 *
 * Récupère les données de deux sources :
 * 1. L'équipement du contexte (locations EN COURS avec tarifs actuels)
 * 2. L'API location-history (locations CLÔTURÉES avec tarifs archivés)
 */

export const analyticsService = {
  /**
   * Filtre les équipements TEST et locations CLIENT TEST
   * Exclut tout ce qui contient "TEST" dans le nom ou le client
   */
  filterTestData(equipmentList) {
    if (!equipmentList) return [];

    return equipmentList.filter(equipment => {
      // Exclure si le nom de l'équipement contient "TEST"
      if (equipment.nom && equipment.nom.toUpperCase().includes('TEST')) {
        return false;
      }

      // Exclure si le client est "CLIENT TEST"
      if (equipment.client && equipment.client.toUpperCase().includes('CLIENT TEST')) {
        return false;
      }

      return true;
    });
  },

  /**
   * Filtre les locations d'historique pour exclure les TEST
   * Exclut les locations avec client "CLIENT TEST"
   */
  filterTestLocations(locationHistory) {
    if (!locationHistory) return [];

    return locationHistory.filter(location => {
      // Exclure si le client est "CLIENT TEST"
      if (location.client && location.client.toUpperCase().includes('CLIENT TEST')) {
        return false;
      }

      return true;
    });
  },

  /**
   * Récupère l'historique de locations d'un équipement
   */
  async getEquipmentLocationHistory(equipmentId) {
    try {
      const response = await fetch(`${API_URL}/api/equipment/${equipmentId}/location-history`);
      if (!response.ok) return [];
      return response.json();
    } catch (error) {
      console.warn(`Erreur historique équipement ${equipmentId}:`, error);
      return [];
    }
  },

  /**
   * Calcule le CA estimatif d'une location EN COURS
   * Prend en compte : jours jusqu'à fin du mois, tarif actuel, minimum facturation
   */
  calculateCurrentLocationEstimatedCA(equipment, month, year) {
    if (equipment.statut !== 'En Location' || !equipment.debutLocation || !equipment.finLocationTheorique) {
      return 0;
    }

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));
    const locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));

    // Intersect avec le mois
    const rangeStart = new Date(Math.max(locationStart, monthStart));
    const rangeEnd = new Date(Math.min(locationEnd, monthEnd));

    if (rangeStart > rangeEnd) return 0;

    const startStr = rangeStart.toISOString().split('T')[0];
    const endStr = rangeEnd.toISOString().split('T')[0];

    const businessDays = calculateBusinessDays(startStr, endStr);

    console.log(`📊 ${equipment.nom} | ${startStr} à ${endStr} | ${businessDays} jours ouvrés`);

    if (businessDays === null || businessDays === 0) return 0;

    // Récupérer le tarif (peut être null)
    let prixHT = equipment.prixHT || 0;
    if (!prixHT) return 0; // Sans tarif, pas de CA

    // Appliquer remise longue durée si applicable
    const isLongDuration = businessDays >= 21;
    let ca = businessDays * prixHT;

    if (isLongDuration) {
      ca = ca * 0.8; // Remise 20%
    }

    // Appliquer minimum facturation
    if (equipment.minimumFacturationApply && equipment.minimumFacturation) {
      ca = Math.max(ca, equipment.minimumFacturation);
    }

    return parseFloat(ca.toFixed(2));
  },

  /**
   * Calcule le CA confirmé d'une location EN COURS
   * Prend en compte : jours DÉJÀ ÉCOULÉS uniquement
   */
  calculateCurrentLocationConfirmedCA(equipment, month, year) {
    if (equipment.statut !== 'En Location' || !equipment.debutLocation) {
      return 0;
    }

    const today = new Date();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));

    // Prendre le minimum entre : fin théorique, aujourd'hui, fin du mois
    const locationEnd = equipment.finLocationTheorique
      ? new Date(convertFrenchToISO(equipment.finLocationTheorique))
      : today;

    const realEnd = new Date(Math.min(today.getTime(), locationEnd.getTime()));

    // Intersect avec le mois
    const rangeStart = new Date(Math.max(locationStart, monthStart));
    const rangeEnd = new Date(Math.min(realEnd, monthEnd));

    if (rangeStart > rangeEnd) return 0;

    const startStr = rangeStart.toISOString().split('T')[0];
    const endStr = rangeEnd.toISOString().split('T')[0];

    const businessDays = calculateBusinessDays(startStr, endStr);

    console.log(`✅ ${equipment.nom} (Confirmé) | ${startStr} à ${endStr} | ${businessDays} jours ouvrés`);

    if (businessDays === null || businessDays === 0) return 0;

    // Récupérer le tarif (peut être null)
    let prixHT = equipment.prixHT || 0;
    if (!prixHT) return 0; // Sans tarif, pas de CA

    // Appliquer remise longue durée
    const isLongDuration = businessDays >= 21;
    let ca = businessDays * prixHT;

    if (isLongDuration) {
      ca = ca * 0.8; // Remise 20%
    }

    // Appliquer minimum facturation
    if (equipment.minimumFacturationApply && equipment.minimumFacturation) {
      ca = Math.max(ca, equipment.minimumFacturation);
    }

    return parseFloat(ca.toFixed(2));
  },

  /**
   * Calcule le CA du mois depuis l'historique ARCHIVÉ avec détails COMPLETS
   * (locations clôturées dans le mois donné)
   * Retourne: { totalCA, count, locations }
   * Exclut automatiquement les locations avec CLIENT TEST
   */
  calculateHistoricalMonthlyCAWithDetails(locationHistory, month, year) {
    // Filtrer les TEST locations
    const filteredHistory = this.filterTestLocations(locationHistory);

    if (!filteredHistory || filteredHistory.length === 0) {
      return { totalCA: 0, count: 0, locations: [] };
    }

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    let totalCA = 0;
    const locations = [];

    filteredHistory.forEach(location => {
      // Utiliser la date de retour réelle ou rentrée
      const returnDateStr = location.date_retour_reel || location.rentre_le;
      if (!returnDateStr) return;

      const returnDate = new Date(returnDateStr);

      // La location a été clôturée ce mois-ci
      if (returnDate >= monthStart && returnDate <= monthEnd) {
        if (location.ca_total_ht) {
          totalCA += parseFloat(location.ca_total_ht);
          locations.push(location);
        }
      }
    });

    return {
      totalCA: parseFloat(totalCA.toFixed(2)),
      count: locations.length,
      locations
    };
  },

  /**
   * Calcule le CA du mois depuis l'historique ARCHIVÉ
   * (locations clôturées dans le mois donné)
   * Exclut automatiquement les locations avec CLIENT TEST
   */
  calculateHistoricalMonthlyCA(locationHistory, month, year) {
    const result = this.calculateHistoricalMonthlyCAWithDetails(locationHistory, month, year);
    return result.totalCA;
  },

  /**
   * Calcule le CA total confirmé de l'année en cours
   */
  calculateYearlyConfirmedCA(caData, year) {
    let totalCA = 0;
    const monthsForYear = [];

    for (const [key, data] of Object.entries(caData)) {
      const [monthYear] = key.split('-');
      const dataYear = parseInt(monthYear);

      if (dataYear === year) {
        monthsForYear.push(key);
        // Pour le mois courant: utiliser CA confirmé
        if (data.isCurrent) {
          totalCA += data.confirmedCA || 0;
        } else {
          // Pour les mois passés: utiliser l'historique
          totalCA += data.historicalCA || 0;
        }
      }
    }

    console.log(`💰 CA annuel ${year}: ${monthsForYear.length} mois trouvés (${monthsForYear.join(', ')}) = ${totalCA}€`);

    return parseFloat(totalCA.toFixed(2));
  },

  /**
   * Récupère et agrège les données CA pour tous les mois
   * Combine historique (mois passés) + locations en cours (mois actuel)
   * Exclut automatiquement TEST equipment et CLIENT TEST
   */
  async getAllMonthsCAData(equipmentList) {
    // Filtrer les données TEST
    const filteredEquipmentList = this.filterTestData(equipmentList);

    if (!filteredEquipmentList || filteredEquipmentList.length === 0) {
      return {};
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const caData = {};

    // Récupère l'historique pour TOUS les équipements
    console.log(`📊 Récupération historique pour ${filteredEquipmentList.length} équipements...`);
    const allHistory = [];

    for (const equipment of filteredEquipmentList) {
      const history = await this.getEquipmentLocationHistory(equipment.id);
      if (history && history.length > 0) {
        allHistory.push(...history);
      }
    }

    console.log(`✅ ${allHistory.length} locations historiques trouvées`);

    // Parcourt tous les mois depuis le début de l'année précédente
    for (let year = currentYear - 1; year <= currentYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(year, month, 1);

        // Ne pas aller dans le futur
        if (monthDate > today) break;

        const key = `${year}-${String(month + 1).padStart(2, '0')}`;

        if (month === currentMonth && year === currentYear) {
          // 🔴 MOIS ACTUEL : Combiner historique + locations en cours
          const historicalCA = this.calculateHistoricalMonthlyCA(allHistory, month, year);

          let estimatedCA = 0;
          let confirmedCA = 0;
          let activeLocations = 0;

          // Ajouter les locations en cours du mois
          filteredEquipmentList.forEach(equipment => {
            if (equipment.statut === 'En Location' && equipment.debutLocation && equipment.finLocationTheorique) {
              const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));
              const locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));

              const monthStart = new Date(year, month, 1);
              const monthEnd = new Date(year, month + 1, 0);

              // Vérifier si la location chevauche le mois
              if (locationStart <= monthEnd && locationEnd >= monthStart) {
                const locEstimated = this.calculateCurrentLocationEstimatedCA(equipment, month, year);
                const locConfirmed = this.calculateCurrentLocationConfirmedCA(equipment, month, year);

                // COMPTER TOUTES LES LOCATIONS ACTIVES, même sans tarif
                activeLocations++;
                estimatedCA += locEstimated;
                confirmedCA += locConfirmed;
              }
            }
          });

          // Total = historique du mois + locations en cours du mois
          caData[key] = {
            estimatedCA: parseFloat((historicalCA + estimatedCA).toFixed(2)),
            confirmedCA: parseFloat((historicalCA + confirmedCA).toFixed(2)),
            isCurrent: true,
            month: month,
            year: year,
            activeLocations: activeLocations
          };

          console.log(`Mois actuel ${key}: Historique=${historicalCA}€, Estimé=${estimatedCA}€, Confirmé=${confirmedCA}€`);
        } else {
          // ⚪ MOIS PASSÉS : Uniquement historique
          const historicalCA = this.calculateHistoricalMonthlyCA(allHistory, month, year);

          caData[key] = {
            historicalCA: historicalCA,
            isCurrent: false,
            month: month,
            year: year
          };

          if (historicalCA > 0) {
            console.log(`Mois passé ${key}: ${historicalCA}€`);
          }
        }
      }
    }

    return caData;
  },

  /**
   * Calcule les stats enrichies pour les KPIs du mois sélectionné
   * Combine l'historique archivé + les locations en cours (pour cohérence avec le graphique)
   * Exclut automatiquement TEST equipment et CLIENT TEST
   */
  async calculateMonthStats(equipmentList, month, year) {
    // Filtrer les données TEST
    const filteredEquipmentList = this.filterTestData(equipmentList);

    let estimatedCA = 0;
    let confirmedCA = 0;
    let activeLocations = 0;
    let totalDays = 0;

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    // Récupérer l'historique (locations clôturées)
    const allHistory = [];
    for (const equipment of filteredEquipmentList) {
      const history = await this.getEquipmentLocationHistory(equipment.id);
      if (history && history.length > 0) {
        allHistory.push(...history);
      }
    }

    // Ajouter le CA de l'historique (locations clôturées ce mois)
    const historicalData = this.calculateHistoricalMonthlyCAWithDetails(allHistory, month, year);
    const historicalCA = historicalData.totalCA;
    const historicalLocationsCount = historicalData.count;
    estimatedCA += historicalCA;
    confirmedCA += historicalCA;

    // Parcourir les locations en cours
    filteredEquipmentList.forEach(equipment => {
      if (equipment.statut === 'En Location' && equipment.debutLocation && equipment.finLocationTheorique) {
        const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));
        const locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));

        // Vérifier si la location chevauche le mois
        if (locationStart <= monthEnd && locationEnd >= monthStart) {
          // Calcul de la durée (pour toutes les locations, avec ou sans tarif)
          const rangeStart = new Date(Math.max(locationStart, monthStart));
          const rangeEnd = new Date(Math.min(locationEnd, monthEnd));

          const businessDays = calculateBusinessDays(
            rangeStart.toISOString().split('T')[0],
            rangeEnd.toISOString().split('T')[0]
          );

          // COMPTER TOUTES LES LOCATIONS ACTIVES, même sans tarif
          if (businessDays && businessDays > 0) {
            activeLocations++;
            totalDays += businessDays;

            // Calcul CA (seulement si la location a un tarif)
            const locEstimated = this.calculateCurrentLocationEstimatedCA(equipment, month, year);
            const locConfirmed = this.calculateCurrentLocationConfirmedCA(equipment, month, year);

            console.log(`📍 ${equipment.nom} | Tarif: ${equipment.prixHT}€/j | Estimé: ${locEstimated}€ | Confirmé: ${locConfirmed}€`);

            estimatedCA += locEstimated;
            confirmedCA += locConfirmed;
          }
        }
      }
    });

    const avgDaysPerLocation = activeLocations > 0 ? Math.round(totalDays / activeLocations) : 0;

    console.log(`\n✅ TOTAL MOIS: Historique=${historicalCA}€ (${historicalLocationsCount} locations) | Estimé Total=${estimatedCA}€ | Confirmé Total=${confirmedCA}€\n`);

    return {
      estimatedCA: parseFloat(estimatedCA.toFixed(2)),
      confirmedCA: parseFloat(confirmedCA.toFixed(2)),
      activeLocations,
      avgDaysPerLocation,
      historicalCA: parseFloat(historicalCA.toFixed(2)),
      historicalLocationsCount,
      historicalLocations: historicalData.locations
    };
  }
};

export default analyticsService;
