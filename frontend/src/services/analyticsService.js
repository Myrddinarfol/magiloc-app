import { API_URL } from '../config/constants';
import { calculateBusinessDays, calculateBusinessDaysByMonth, convertFrenchToISO } from '../utils/dateHelpers';

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
   * Calcule le CA estimatif d'une location EN COURS POUR UN MOIS SPÉCIFIQUE
   *
   * IMPORTANT: Répartit correctement les jours quand une location chevauche plusieurs mois
   * Exemple: Location 25/09 au 09/10
   *   - Pour septembre: 4 jours (25, 26, 29, 30)
   *   - Pour octobre: 7 jours (1, 2, 3, 6, 7, 8, 9)
   *
   * @param {Object} equipment - L'équipement avec location
   * @param {number} month - Index du mois (0-11)
   * @param {number} year - L'année
   * @returns {number} CA estimatif pour ce mois uniquement
   */
  calculateCurrentLocationEstimatedCAByMonth(equipment, month, year) {
    // IMPORTANT: Ne pas facturer les matériels en prêt
    if (equipment.statut !== 'En Location' || !equipment.debutLocation || equipment.estPret) {
      return 0;
    }

    const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));
    const today = new Date();
    const monthEnd = new Date(year, month + 1, 0);

    // Si pas de date fin théorique, utiliser fin du mois demandé
    let locationEnd = locationStart;
    if (equipment.finLocationTheorique) {
      locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));

      // ✅ FIX: Si la fin théorique est DÉPASSÉE et qu'on est le dernier jour du mois,
      // utiliser fin du mois au lieu de la fin théorique
      if (locationEnd < today && today <= monthEnd) {
        console.log(`⚠️  ${equipment.nom}: fin théorique dépassée (${equipment.finLocationTheorique}), utilisation fin du mois`);
        locationEnd = monthEnd;
      }
    } else {
      // Pas de date fin théorique → utiliser fin du mois
      locationEnd = monthEnd;
      console.log(`⚠️  ${equipment.nom}: calculateCurrentLocationEstimatedCAByMonth - pas de finLocationTheorique, utilisation fin du mois`);
    }

    // Obtenir la répartition des jours par mois
    const startStr = locationStart.toISOString().split('T')[0];
    const endStr = locationEnd.toISOString().split('T')[0];
    const monthlyDays = calculateBusinessDaysByMonth(startStr, endStr);

    // Clé pour le mois cible
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const businessDaysThisMonth = monthlyDays[monthKey] || 0;

    console.log(`📊 ${equipment.nom} | Mois ${monthKey} | ${businessDaysThisMonth} jours ouvrés`);

    // Si minimum de facturation coché, CA = minimum (pas de calcul sur jours)
    if (equipment.minimumFacturationApply && equipment.minimumFacturation) {
      console.log(`💰 Minimum facturation appliqué: ${equipment.minimumFacturation}€`);
      return parseFloat(parseFloat(equipment.minimumFacturation).toFixed(2));
    }

    if (businessDaysThisMonth === 0) return 0;

    // Récupérer le tarif
    let prixHT = equipment.prixHT || 0;
    if (!prixHT) return 0; // Sans tarif, pas de CA

    // Calcul du CA pour ce mois
    let ca = businessDaysThisMonth * prixHT;

    // IMPORTANT: La remise longue durée s'applique sur la durée TOTALE de la location, pas par mois
    const totalDays = calculateBusinessDays(startStr, endStr);
    if (totalDays >= 21) {
      ca = ca * 0.8; // Remise 20%
    }

    return parseFloat(ca.toFixed(2));
  },

  /**
   * Calcule le CA estimatif d'une location EN COURS (version LEGACY - tout le mois)
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

    // Si minimum de facturation coché, CA = minimum (strictement)
    if (equipment.minimumFacturationApply && equipment.minimumFacturation) {
      ca = parseFloat(equipment.minimumFacturation) || 0;
    }

    return parseFloat(ca.toFixed(2));
  },

  /**
   * Calcule le CA confirmé d'une location EN COURS POUR UN MOIS SPÉCIFIQUE
   *
   * IMPORTANT: Répartit correctement les jours quand une location chevauche plusieurs mois
   * Ne compte que les jours DÉJÀ ÉCOULÉS (jours passés, pas futurs)
   *
   * @param {Object} equipment - L'équipement avec location
   * @param {number} month - Index du mois (0-11)
   * @param {number} year - L'année
   * @returns {number} CA confirmé pour ce mois uniquement
   */
  calculateCurrentLocationConfirmedCAByMonth(equipment, month, year) {
    // IMPORTANT: Ne pas facturer les matériels en prêt
    if (equipment.statut !== 'En Location' || !equipment.debutLocation || equipment.estPret) {
      return 0;
    }

    const today = new Date();
    const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));
    const monthEnd = new Date(year, month + 1, 0);

    // Si pas de date fin théorique, utiliser fin du mois demandé
    let locationEnd = today; // Par défaut, jusqu'à aujourd'hui
    if (equipment.finLocationTheorique) {
      locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));
    } else {
      // Pas de date fin théorique → jusqu'à fin du mois demandé si avant aujourd'hui
      locationEnd = monthEnd < today ? monthEnd : today;
      console.log(`⚠️  ${equipment.nom}: calculateCurrentLocationConfirmedCAByMonth - pas de finLocationTheorique, utilisation fin du mois ou aujourd'hui`);
    }

    // ✅ FIX: La fin réelle = minimum entre (fin théorique OU fin du mois) et aujourd'hui
    // Si fin théorique est dépassée, compter jusqu'à fin du mois, pas jusqu'à la date passée
    let realEnd = new Date(Math.min(today.getTime(), locationEnd.getTime()));
    if (realEnd < monthEnd && locationEnd < monthEnd) {
      // Si fin théorique est avant fin du mois, utiliser fin du mois comme limite
      realEnd = monthEnd;
    }

    // Obtenir la répartition des jours par mois (jusqu'à realEnd)
    const startStr = locationStart.toISOString().split('T')[0];
    const endStr = realEnd.toISOString().split('T')[0];
    const monthlyDays = calculateBusinessDaysByMonth(startStr, endStr);

    // Clé pour le mois cible
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const businessDaysThisMonth = monthlyDays[monthKey] || 0;

    console.log(`✅ ${equipment.nom} (Confirmé) | Mois ${monthKey} | ${businessDaysThisMonth} jours ouvrés`);

    if (businessDaysThisMonth === 0) return 0;

    // Récupérer le tarif
    let prixHT = equipment.prixHT || 0;
    if (!prixHT) return 0; // Sans tarif, pas de CA

    // Calcul du CA pour ce mois
    let ca = businessDaysThisMonth * prixHT;

    // IMPORTANT: La remise longue durée s'applique sur la durée TOTALE de la location jusqu'à aujourd'hui
    const totalDays = calculateBusinessDays(startStr, endStr);
    if (totalDays >= 21) {
      ca = ca * 0.8; // Remise 20%
    }

    // ❌ NE PAS appliquer le minimum ici - c'est un calcul CONFIRMÉ (jours écoulés)
    // Le minimum s'applique à la FIN de la location, pas partiellement

    return parseFloat(ca.toFixed(2));
  },

  /**
   * Calcule le CA confirmé d'une location EN COURS (version LEGACY - tout le mois)
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

    // ❌ NE PAS appliquer le minimum ici - c'est un calcul CONFIRMÉ (jours écoulés)
    // Le minimum s'applique à la FIN de la location, pas partiellement

    return parseFloat(ca.toFixed(2));
  },

  /**
   * Calcule le CA réparti par mois pour les locations archivées
   * IMPORTANT: Répartit le CA des locations multi-mois correctement
   * Contrairement à calculateHistoricalMonthlyCAWithDetails qui compte
   * les locations fermées CE MOIS, celle-ci répartit correctement les
   * locations multi-mois par mois de déroulement
   * Retourne: { totalCA, count, locations }
   */
  async calculateHistoricalMonthlyCAWithMonthlyRepartition(locationHistory, month, year) {
    const { calculateBusinessDays, calculateBusinessDaysByMonth } = await import('../utils/dateHelpers');

    // Filtrer les TEST locations
    const filteredHistory = this.filterTestLocations(locationHistory);

    if (!filteredHistory || filteredHistory.length === 0) {
      return { totalCA: 0, count: 0, locations: [] };
    }

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    let totalCA = 0;
    const locations = [];

    filteredHistory.forEach(location => {
      // IMPORTANT: Exclure les locations marquées comme prêt
      if (location.est_pret) return;

      // Récupérer les dates de début et fin
      const startDateStr = location.date_debut || location.loue_le;
      const endDateStr = location.date_retour_reel || location.rentre_le;

      if (!startDateStr || !endDateStr) return;

      const locationStart = new Date(startDateStr);
      const locationEnd = new Date(endDateStr);

      // Vérifier si la location chevauche ce mois
      if (locationStart <= monthEnd && locationEnd >= monthStart) {
        // Calculer la partie qui se chevauche ce mois
        const overlapStart = new Date(Math.max(locationStart.getTime(), monthStart.getTime()));
        const overlapEnd = new Date(Math.min(locationEnd.getTime(), monthEnd.getTime()));

        const startStr = overlapStart.toISOString().split('T')[0];
        const endStr = overlapEnd.toISOString().split('T')[0];

        // Jours du mois pour cette location
        const businessDaysThisMonth = calculateBusinessDays(startStr, endStr);

        // Jours TOTAUX de la location
        const totalLocationDays = calculateBusinessDays(
          locationStart.toISOString().split('T')[0],
          locationEnd.toISOString().split('T')[0]
        );

        // Répartir le CA en proportion des jours ce mois
        if (businessDaysThisMonth > 0 && totalLocationDays > 0 && location.ca_total_ht) {
          const totalCAValue = parseFloat(location.ca_total_ht) || 0;
          const caThisMonth = (businessDaysThisMonth / totalLocationDays) * totalCAValue;

          if (typeof caThisMonth === 'number' && !isNaN(caThisMonth)) {
            totalCA += caThisMonth;
            locations.push({
              ...location,
              businessDaysThisMonth,
              caThisMonth
            });
          }
        }
      }
    });

    return {
      totalCA: parseFloat(totalCA.toFixed(2)),
      count: locations.length,
      locations
    };
  },

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
        const isLoan = location.est_pret === true || location.est_pret === 1;

        if (isLoan) {
          // Les prêts ont CA = 0 mais doivent être affichés
          locations.push(location);
        } else if (location.ca_total_ht) {
          // Les locations normales comptent dans le CA
          const caValue = parseFloat(location.ca_total_ht) || 0;
          if (typeof caValue === 'number' && !isNaN(caValue)) {
            totalCA += caValue;
            locations.push(location);
          }
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
   * IMPORTANT: Somme le CA confirmé de CHAQUE mois (cohérence garantie)
   */
  calculateYearlyConfirmedCA(caData, year) {
    let totalCA = 0;
    const monthsForYear = [];
    const monthDetails = [];

    for (const [key, data] of Object.entries(caData)) {
      const [monthYear] = key.split('-');
      const dataYear = parseInt(monthYear);

      if (dataYear === year) {
        monthsForYear.push(key);
        // Pour TOUS les mois (courant ET passés): utiliser CA confirmé
        // Chaque mois doit avoir un CA confirmé calculé correctement avec répartition
        const monthConfirmedCA = data.confirmedCA || 0;
        monthDetails.push({ key, value: monthConfirmedCA });
        totalCA += monthConfirmedCA;
      }
    }

    console.log(`💰 CA annuel ${year}: ${monthsForYear.length} mois trouvés`);
    console.log(`📅 Détails par mois:`, monthDetails);
    console.log(`💵 Total CA ${year}: ${totalCA}€`);

    return typeof totalCA === 'number' && !isNaN(totalCA) ? parseFloat(totalCA.toFixed(2)) : 0;
  },

  /**
   * Calcule le CA annuel pour CHAQUE mois de l'année en cours
   * Utilise getMonthLocationBreakdown pour chaque mois (source de vérité unique)
   * OPTIMISÉ: Parallelise tous les appels pour gagner du temps
   */
  async getYearlyCAData(equipmentList, requestedYear = null) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Utiliser l'année demandée, ou l'année actuelle par défaut
    const targetYear = requestedYear || currentYear;
    console.log(`📊 getYearlyCAData pour l'année ${targetYear} (actuelle: ${currentYear})`);

    const caData = {};

    // Créer un array de promises pour paralleliser
    const monthPromises = [];

    // Déterminer le mois final de la boucle
    // Si c'est l'année actuelle, boucler jusqu'au mois actuel
    // Sinon, boucler jusqu'à décembre (11)
    const maxMonth = targetYear === currentYear ? currentMonth : 11;

    for (let month = 0; month <= maxMonth; month++) {
      const key = `${targetYear}-${String(month + 1).padStart(2, '0')}`;

      monthPromises.push(
        this.getMonthLocationBreakdown(equipmentList, month, targetYear)
          .then(breakdown => ({
            key,
            month,
            confirmedCA: breakdown.summary.totalCAConfirmed,
            estimatedCA: breakdown.summary.totalCAEstimated,
            activeLocations: breakdown.summary.ongoingCount + breakdown.summary.closedCount,
            ongoingLocations: breakdown.ongoingLocations,
            closedLocations: breakdown.closedLocations
          }))
          .catch(error => {
            console.error(`❌ Erreur calcul CA pour ${key}:`, error);
            return {
              key,
              month,
              confirmedCA: 0,
              estimatedCA: 0,
              activeLocations: 0,
              ongoingLocations: [],
              closedLocations: []
            };
          })
      );
    }

    // Attendre tous les appels en parallèle
    const results = await Promise.all(monthPromises);

    // Remplir caData avec les résultats
    results.forEach(result => {
      caData[result.key] = {
        confirmedCA: result.confirmedCA,
        estimatedCA: result.estimatedCA,
        isCurrent: result.month === currentMonth && targetYear === currentYear,
        month: result.month,
        year: targetYear,
        activeLocations: result.activeLocations,
        ongoingLocations: result.ongoingLocations,
        closedLocations: result.closedLocations
      };

      console.log(`📅 ${result.key}: Confirmé=${result.confirmedCA}€, Estimé=${result.estimatedCA}€`);
    });

    return caData;
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
        // Filtrer les locations CLIENT TEST (sécurité supplémentaire)
        const filteredHistory = this.filterTestLocations(history);
        allHistory.push(...filteredHistory);
      }
    }

    console.log(`✅ ${allHistory.length} locations historiques trouvées (TEST exclus)`);

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

          // Ajouter les locations en cours du mois (avec répartition correcte des jours multi-mois)
          filteredEquipmentList.forEach(equipment => {
            // Accepter les locations AVEC ou SANS finLocationTheorique (gestion cohérente)
            // IMPORTANT: Exclure les matériels en prêt
            if (equipment.statut === 'En Location' && equipment.debutLocation && !equipment.estPret) {
              const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));

              // Si pas de date fin théorique, utiliser fin du mois demandé
              let locationEnd = equipment.finLocationTheorique
                ? new Date(convertFrenchToISO(equipment.finLocationTheorique))
                : new Date(year, month + 1, 0);

              const monthStart = new Date(year, month, 1);
              const monthEnd = new Date(year, month + 1, 0);

              // Vérifier si la location chevauche le mois
              if (locationStart <= monthEnd && locationEnd >= monthStart) {
                // UTILISER LES NOUVELLES FONCTIONS AVEC RÉPARTITION PAR MOIS
                const locEstimated = this.calculateCurrentLocationEstimatedCAByMonth(equipment, month, year);
                const locConfirmed = this.calculateCurrentLocationConfirmedCAByMonth(equipment, month, year);

                // COMPTER TOUTES LES LOCATIONS ACTIVES, même sans tarif
                activeLocations++;
                estimatedCA += locEstimated;
                confirmedCA += locConfirmed;
              }
            }
          });

          // Total = historique du mois + locations en cours du mois
          const safeTotalEstimated = typeof (historicalCA + estimatedCA) === 'number' && !isNaN(historicalCA + estimatedCA)
            ? parseFloat((historicalCA + estimatedCA).toFixed(2))
            : 0;
          const safeTotalConfirmed = typeof (historicalCA + confirmedCA) === 'number' && !isNaN(historicalCA + confirmedCA)
            ? parseFloat((historicalCA + confirmedCA).toFixed(2))
            : 0;

          caData[key] = {
            estimatedCA: safeTotalEstimated,
            confirmedCA: safeTotalConfirmed,
            isCurrent: true,
            month: month,
            year: year,
            activeLocations: activeLocations
          };

          console.log(`Mois actuel ${key}: Historique=${historicalCA}€, Estimé=${estimatedCA}€, Confirmé=${confirmedCA}€`);
        } else {
          // ⚪ MOIS PASSÉS : Calculer le CA réparti correctement
          // Pour les mois passés, on utilise l'historique COMPLET avec répartition par mois
          const historicalCAData = await this.calculateHistoricalMonthlyCAWithMonthlyRepartition(allHistory, month, year);

          // IMPORTANT: Pour les mois passés de l'année courante, ajouter aussi le CA des locations
          // qui ÉTAIENT en cours ces mois-là (même si elles ne se sont fermées qu'après)
          let confirmedCA = historicalCAData.totalCA;

          if (year === currentYear) {
            // Pour les mois passés de l'année courante, calculer aussi le CA des locations
            // en cours qui déroulaient ce mois (avant d'être fermées)
            let additionalCA = 0;
            const additionalLocations = [];

            for (const equipment of filteredEquipmentList) {
              // Chercher les équipements qui n'étaient pas en location ce mois-ci
              // (mais qui auraient pu l'être dans le passé)
              const locationStart = equipment.debutLocation
                ? new Date(convertFrenchToISO(equipment.debutLocation))
                : null;

              // Chercher dans l'historique si cet équipement avait une location ce mois
              const equipmentHistory = allHistory.filter(h => h.equipment_id === equipment.id);

              for (const location of equipmentHistory) {
                const startDateStr = location.date_debut || location.loue_le;
                const endDateStr = location.date_retour_reel || location.rentre_le;

                if (!startDateStr || !endDateStr) continue;
                if (location.est_pret) continue;

                const locStart = new Date(startDateStr);
                const locEnd = new Date(endDateStr);

                const monthStart = new Date(year, month, 1);
                const monthEnd = new Date(year, month + 1, 0);

                // Vérifier si la location chevauche ce mois
                if (locStart <= monthEnd && locEnd >= monthStart) {
                  // Vérifier que cette location n'est pas déjà comptée
                  const alreadyInHistory = historicalCAData.locations.some(h => h.id === location.id);
                  if (!alreadyInHistory) {
                    // Répartir le CA
                    const overlapStart = new Date(Math.max(locStart.getTime(), monthStart.getTime()));
                    const overlapEnd = new Date(Math.min(locEnd.getTime(), monthEnd.getTime()));

                    const startStr = overlapStart.toISOString().split('T')[0];
                    const endStr = overlapEnd.toISOString().split('T')[0];

                    const { calculateBusinessDays } = await import('../utils/dateHelpers');
                    const businessDaysThisMonth = calculateBusinessDays(startStr, endStr);
                    const totalLocationDays = calculateBusinessDays(
                      locStart.toISOString().split('T')[0],
                      locEnd.toISOString().split('T')[0]
                    );

                    if (businessDaysThisMonth > 0 && totalLocationDays > 0 && location.ca_total_ht) {
                      const totalCAValue = parseFloat(location.ca_total_ht) || 0;
                      const caThisMonth = (businessDaysThisMonth / totalLocationDays) * totalCAValue;

                      if (typeof caThisMonth === 'number' && !isNaN(caThisMonth)) {
                        additionalCA += caThisMonth;
                        additionalLocations.push(location);
                      }
                    }
                  }
                }
              }
            }

            confirmedCA += additionalCA;
            if (additionalCA > 0) {
              console.log(`Mois passé ${key}: +${additionalCA}€ CA additionnel (${additionalLocations.length} locations historiques)`);
            }
          }

          caData[key] = {
            confirmedCA: confirmedCA,
            historicalCA: confirmedCA, // Pour compatibilité avec l'interface
            isCurrent: false,
            month: month,
            year: year
          };

          if (confirmedCA > 0) {
            console.log(`Mois passé ${key}: ${confirmedCA}€ total`);
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
        // Filtrer les locations CLIENT TEST (sécurité supplémentaire)
        const filteredHistory = this.filterTestLocations(history);
        allHistory.push(...filteredHistory);
      }
    }

    // Ajouter le CA de l'historique (locations clôturées ce mois)
    const historicalData = this.calculateHistoricalMonthlyCAWithDetails(allHistory, month, year);
    const historicalCA = historicalData.totalCA;
    const historicalLocationsCount = historicalData.count;
    estimatedCA += historicalCA;
    confirmedCA += historicalCA;

    // Parcourir les locations en cours (avec répartition correcte des jours multi-mois)
    filteredEquipmentList.forEach(equipment => {
      // Accepter les locations AVEC ou SANS finLocationTheorique (gestion cohérente avec getMonthLocationBreakdown)
      // IMPORTANT: Exclure les matériels en prêt
      if (equipment.statut === 'En Location' && equipment.debutLocation && !equipment.estPret) {
        const locationStart = new Date(convertFrenchToISO(equipment.debutLocation));

        // Si pas de date fin théorique, utiliser fin du mois demandé (cohérent avec getMonthLocationBreakdown)
        let locationEnd = locationStart;
        if (equipment.finLocationTheorique) {
          locationEnd = new Date(convertFrenchToISO(equipment.finLocationTheorique));
        } else {
          // Pas de date fin → utiliser fin du mois demandé
          locationEnd = monthEnd;
          console.log(`⚠️  ${equipment.nom}: pas de finLocationTheorique, utilisation fin du mois`);
        }

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

            // Calcul CA avec RÉPARTITION PAR MOIS (seulement si la location a un tarif)
            const locEstimated = this.calculateCurrentLocationEstimatedCAByMonth(equipment, month, year);
            const locConfirmed = this.calculateCurrentLocationConfirmedCAByMonth(equipment, month, year);

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
      estimatedCA: typeof estimatedCA === 'number' && !isNaN(estimatedCA) ? parseFloat(estimatedCA.toFixed(2)) : 0,
      confirmedCA: typeof confirmedCA === 'number' && !isNaN(confirmedCA) ? parseFloat(confirmedCA.toFixed(2)) : 0,
      activeLocations,
      avgDaysPerLocation,
      historicalCA: typeof historicalCA === 'number' && !isNaN(historicalCA) ? parseFloat(historicalCA.toFixed(2)) : 0,
      historicalLocationsCount,
      historicalLocations: historicalData.locations
    };
  },

  // Récupère le détail complet des locations pour un mois (fermées + en cours)
  async getMonthLocationBreakdown(equipmentData, month, year) {
    console.log(`🔍 getMonthLocationBreakdown appelé pour ${year}-${String(month + 1).padStart(2, '0')}`);
    const { calculateBusinessDays, calculateBusinessDaysByMonth } = await import('../utils/dateHelpers');

    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const today = new Date();
    const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();

    const closedLocations = [];
    const ongoingLocations = [];
    const loanLocations = []; // Locations en prêt (pour trace informationnelle)

    // 1. Récupérer les locations en cours (equipments)
    const filteredEquipment = this.filterTestData(equipmentData);
    const equipmentInLocation = filteredEquipment.filter(e => e.statut === 'En Location');
    console.log(`   📦 Total équipements en location: ${equipmentInLocation.length}`);

    for (const equipment of filteredEquipment) {
      // Vérifier si l'équipement est en location le mois demandé
      if (equipment.statut !== 'En Location') continue;

      // IMPORTANT: Tracker les matériels en prêt séparément (avant de les exclure du CA)
      if (equipment.estPret) {
        console.log(`   🎁 ${equipment.nom}: matériel en prêt, tracked séparément`);

        // Parser les dates
        let startDate = equipment.debutLocation;
        let endDate = equipment.finLocationTheorique;
        if (startDate && startDate.includes('/')) {
          const [day, month, year] = startDate.split('/');
          startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } else if (startDate && startDate.includes('T')) {
          startDate = startDate.split('T')[0];
        }
        if (endDate && endDate.includes('/')) {
          const [day, month, year] = endDate.split('/');
          endDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } else if (endDate && endDate.includes('T')) {
          endDate = endDate.split('T')[0];
        }

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const locationStart = new Date(startDate);
        const locationEnd = endDate ? new Date(endDate) : monthEnd;

        // Vérifier si ça chevauche le mois
        if (locationStart <= monthEnd && locationEnd >= monthStart) {
          const businessDaysThisMonth = calculateBusinessDaysByMonth(startDate, endDate || monthEnd.toISOString().split('T')[0])[monthKey] || 0;

          loanLocations.push({
            id: equipment.id,
            client: equipment.client || 'N/A',
            designation: equipment.designation || equipment.nom || 'N/A',
            cmu: equipment.cmu || '',
            modele: equipment.modele || '',
            marque: equipment.marque || '',
            startDate,
            endDate,
            businessDaysThisMonth,
            status: 'loan'
          });
        }

        continue; // Exclure du CA normal
      }

      if (!equipment.debutLocation) {
        console.log(`   ⚠️  ${equipment.nom}: date de début manquante`);
        continue;
      }

      // Si pas de date fin théorique mais EN LOCATION, c'est une location non terminée/indéfinie
      // On va la compter jusqu'à fin du mois demandé

      // Parser les dates correctement (peuvent être en format français DD/MM/YYYY ou ISO YYYY-MM-DD)
      let startDate = equipment.debutLocation;
      let endDate = equipment.finLocationTheorique;

      // Convertir format français DD/MM/YYYY en ISO YYYY-MM-DD si nécessaire
      if (startDate && startDate.includes('/')) {
        const [day, month, year] = startDate.split('/');
        startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (startDate && startDate.includes('T')) {
        startDate = startDate.split('T')[0];
      }

      if (endDate && endDate.includes('/')) {
        const [day, month, year] = endDate.split('/');
        endDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (endDate && endDate.includes('T')) {
        endDate = endDate.split('T')[0];
      }

      // Vérifier si cette location chevauche le mois demandé
      const startMonth = startDate.substring(0, 7);

      // Si pas de date fin, considérer que la location est indéfinie/en cours → utiliser fin du mois
      let effectiveEndDate = endDate;
      if (!endDate) {
        const monthEnd = new Date(year, month + 1, 0);
        effectiveEndDate = monthEnd.toISOString().split('T')[0];
        console.log(`   ⚠️  ${equipment.nom}: pas de date fin théorique! Utilisation fin du mois: ${effectiveEndDate}`);
      }

      const endMonth = effectiveEndDate.substring(0, 7);

      if (monthKey < startMonth || monthKey > endMonth) {
        console.log(`   ❌ ${equipment.nom}: ne chevauche pas ${monthKey} (${startMonth} à ${endMonth})`);
        continue;
      }

      console.log(`   ✅ Location en cours trouvée pour ${monthKey}: ${equipment.nom} (${equipment.client})`);

      // IMPORTANT: Si la location a dépassé sa date théorique, utiliser la date réelle (fin du mois)
      const today = new Date();
      if (endDate) { // Seulement si on a une date théorique à comparer
        const theoreticalEndDate = new Date(endDate);
        if (theoreticalEndDate < today) {
          // La location a dépassé sa date théorique → utiliser fin du mois
          const monthEnd = new Date(year, month + 1, 0);
          effectiveEndDate = monthEnd.toISOString().split('T')[0];
          console.log(`   ⚠️  ${equipment.nom}: dépassement! Fin théorique: ${endDate}, fin réelle: ${effectiveEndDate}`);
        }
      }

      // Calculer les jours ouvrés par mois pour cette location
      // IMPORTANT: Utiliser la vraie date de fin théorique pour calculer la remise 20%, pas effectiveEndDate!
      const totalBusinessDays = calculateBusinessDays(startDate, endDate || effectiveEndDate);
      const businessDaysByMonth = calculateBusinessDaysByMonth(startDate, effectiveEndDate);
      const businessDaysThisMonth = businessDaysByMonth[monthKey] || 0;

      if (businessDaysThisMonth === 0) continue;

      // Calculer le nombre de jours confirmes (jusqu'à aujourd'hui ou fin du mois si dépassement)
      const realEndForConfirmed = isCurrentMonth
        ? new Date().toISOString().split('T')[0]
        : effectiveEndDate;

      const businessDaysByMonthConfirmed = calculateBusinessDaysByMonth(startDate, realEndForConfirmed);
      const businessDaysConfirmedThisMonth = businessDaysByMonthConfirmed[monthKey] || 0;

      // Jours estimés restants = jours totaux - jours confirmés
      const businessDaysEstimatedRemaining = businessDaysThisMonth - businessDaysConfirmedThisMonth;

      // Appliquer les calculs de CA
      const dailyRate = parseFloat(equipment.prixHT) || 0;
      // IMPORTANT: Vérifier la remise basée sur la durée THÉORIQUE, pas effectiveEndDate
      const hasLongDurationDiscount = totalBusinessDays >= 21;
      const hasMinimumBilling = equipment.minimumFacturationApply && equipment.minimumFacturation;

      // CA Confirmé pour ce mois
      // IMPORTANT: Pour les locations EN COURS, le confirmé = jours écoulés seulement
      // Le minimum ne s'applique que sur la DURÉE TOTALE, pas partiellement
      let caConfirmedThisMonth = businessDaysConfirmedThisMonth * dailyRate;
      if (hasLongDurationDiscount) caConfirmedThisMonth *= 0.8;
      // ❌ NE PAS appliquer le minimum ici, c'est un calcul partiel (jours écoulés)
      // Le minimum s'applique sur la durée TOTALE à la fin de la location

      // CA Estimé pour ce mois (projection jusqu'à fin théorique)
      let caEstimatedThisMonth = businessDaysThisMonth * dailyRate;
      if (hasLongDurationDiscount) caEstimatedThisMonth *= 0.8;
      // ✅ APPLIQUER le minimum ici, car c'est la projection TOTALE
      if (hasMinimumBilling) {
        caEstimatedThisMonth = parseFloat(equipment.minimumFacturation) || 0;
      }

      console.log(`   📦 Equipment: ${equipment.id} - nom: ${equipment.nom}, designation: ${equipment.designation}`);

      // Sécuriser les valeurs CA avant de les convertir
      const safeConfirmedCA = typeof caConfirmedThisMonth === 'number' && !isNaN(caConfirmedThisMonth)
        ? parseFloat(caConfirmedThisMonth.toFixed(2))
        : 0;
      const safeEstimatedCA = typeof caEstimatedThisMonth === 'number' && !isNaN(caEstimatedThisMonth)
        ? parseFloat(caEstimatedThisMonth.toFixed(2))
        : 0;

      ongoingLocations.push({
        id: equipment.id,
        client: equipment.client || 'N/A',
        designation: equipment.designation || equipment.nom || 'N/A',
        cmu: equipment.cmu || '',
        modele: equipment.modele || '',
        marque: equipment.marque || '',
        startDate,
        endDateTheoretical: endDate,
        endDateEffective: effectiveEndDate,
        hasNoEndDate: !endDate,
        businessDaysConfirmedThisMonth,
        businessDaysEstimatedRemaining,
        businessDaysThisMonth,
        totalBusinessDaysPlanned: totalBusinessDays,
        dailyRate,
        discount20Applied: hasLongDurationDiscount,
        minBillingApplied: hasMinimumBilling,
        caConfirmedThisMonth: safeConfirmedCA,
        caEstimatedThisMonth: safeEstimatedCA,
        status: 'ongoing'
      });
    }

    // 2. Récupérer les locations fermées ce mois (location_history)
    // Fetch location history from all equipment
    const allHistoricalLocations = [];
    for (const equipment of filteredEquipment) {
      const history = await this.getEquipmentLocationHistory(equipment.id);
      if (history && history.length > 0) {
        // Filtrer les locations CLIENT TEST (sécurité supplémentaire)
        const filteredHistory = this.filterTestLocations(history);
        // Ajouter l'ID de l'équipement et ses détails à chaque location
        for (const loc of filteredHistory) {
          allHistoricalLocations.push({
            ...loc,
            equipment_designation: equipment.designation || equipment.nom || 'N/A',
            cmu: equipment.cmu || '',
            modele: equipment.modele || '',
            marque: equipment.marque || ''
          });
        }
      }
    }

    console.log(`   📋 Total locations fermées trouvées (TEST exclus): ${allHistoricalLocations.length}`);

    for (const location of allHistoricalLocations) {
      // Parser les dates correctement (peuvent être en format français DD/MM/YYYY ou ISO YYYY-MM-DD)
      let startDate = location.date_debut;
      let endDate = (location.date_retour_reel || location.date_fin_theorique);

      // Convertir format français DD/MM/YYYY en ISO YYYY-MM-DD si nécessaire
      if (startDate && startDate.includes('/')) {
        const [day, month, year] = startDate.split('/');
        startDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (startDate && startDate.includes('T')) {
        startDate = startDate.split('T')[0];
      }

      if (endDate && endDate.includes('/')) {
        const [day, month, year] = endDate.split('/');
        endDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (endDate && endDate.includes('T')) {
        endDate = endDate.split('T')[0];
      }

      const endDateStr = endDate;

      // Vérifier si cette location chevauche le mois demandé
      const startMonth = startDate.substring(0, 7);
      const endMonth = endDateStr.substring(0, 7);

      if (monthKey < startMonth || monthKey > endMonth) {
        continue;
      }

      const totalBusinessDays = calculateBusinessDays(startDate, endDateStr);
      const businessDaysByMonth = calculateBusinessDaysByMonth(startDate, endDateStr);
      const businessDaysThisMonth = businessDaysByMonth[monthKey] || 0;

      if (businessDaysThisMonth === 0) continue;

      const dailyRate = parseFloat(location.prix_ht_jour) || 0;
      const hasLongDurationDiscount = location.remise_ld === true;

      // IMPORTANT: Si c'est un prêt, l'ajouter à loanLocations au lieu de closedLocations
      if (location.est_pret) {
        console.log(`   🎁 Location fermée ${location.id}: prêt, tracked séparément`);
        loanLocations.push({
          id: location.id,
          client: location.client || 'N/A',
          designation: location.equipment_designation || 'N/A',
          cmu: location.cmu || '',
          modele: location.modele || '',
          marque: location.marque || '',
          startDate,
          endDate: endDateStr,
          businessDaysThisMonth,
          status: 'loan'
        });
        continue;
      }

      // Pour une location fermée, CA confirmé = CA total archivé dans location_history
      // IMPORTANT: Utiliser CA_TOTAL_HT de la BDD, pas recalculer depuis jours × tarif
      // Car le CA en BDD tient compte du minimum de facturation appliqué
      let caThisMonth = parseFloat(location.ca_total_ht) || 0;

      // Sécuriser la valeur CA avant de la convertir
      const safeCAThisMonth = typeof caThisMonth === 'number' && !isNaN(caThisMonth)
        ? parseFloat(caThisMonth.toFixed(2))
        : 0;

      closedLocations.push({
        id: location.id,
        client: location.client || 'N/A',
        designation: location.equipment_designation || 'N/A',
        cmu: location.cmu || '',
        modele: location.modele || '',
        marque: location.marque || '',
        startDate,
        endDate: endDateStr,
        businessDaysThisMonth,
        totalBusinessDays,
        dailyRate,
        discount20Applied: hasLongDurationDiscount,
        caThisMonth: safeCAThisMonth,
        status: 'closed'
      });
    }

    // 3. Retourner les données structurées
    const totalCAConfirmed = ongoingLocations.reduce((sum, loc) => sum + loc.caConfirmedThisMonth, 0) +
                             closedLocations.reduce((sum, loc) => sum + loc.caThisMonth, 0);

    const totalCAEstimated = ongoingLocations.reduce((sum, loc) => sum + loc.caEstimatedThisMonth, 0) +
                             closedLocations.reduce((sum, loc) => sum + loc.caThisMonth, 0);

    console.log(`📊 Breakdown ${monthKey}: ${ongoingLocations.length} en cours + ${closedLocations.length} fermées + ${loanLocations.length} prêts = ${ongoingLocations.length + closedLocations.length + loanLocations.length} total`);

    return {
      closedLocations,
      ongoingLocations,
      loanLocations,
      summary: {
        totalCAConfirmed: parseFloat(totalCAConfirmed.toFixed(2)),
        totalCAEstimated: parseFloat(totalCAEstimated.toFixed(2)),
        closedCount: closedLocations.length,
        ongoingCount: ongoingLocations.length,
        loanCount: loanLocations.length
      }
    };
  },

  /**
   * Agrège les clients et équipements pour l'année entière en utilisant yearlyCAData
   * SOURCE DE VÉRITÉ: utilise les mêmes données que le CA annuel
   * Garantit la cohérence entre le CA annuel (haut) et les pie charts (bas)
   */
  getYearClientAndEquipmentBreakdown(yearlyCAData) {
    console.log('📊 Agrégation clients/équipements depuis yearlyCAData');

    const clientCAMap = {};
    const equipmentCAMap = {};
    let totalLocationsCount = 0;

    // Itérer sur tous les mois de l'année
    Object.entries(yearlyCAData).forEach(([monthKey, monthData]) => {
      console.log(`  📅 Traitement ${monthKey}: ${monthData.ongoingLocations?.length || 0} en cours + ${monthData.closedLocations?.length || 0} fermées`);

      // Agrégation des locations en cours
      if (monthData.ongoingLocations) {
        monthData.ongoingLocations.forEach(location => {
          const client = location.client || 'N/A';
          const equipment = location.designation || 'N/A';
          const ca = location.caConfirmedThisMonth || location.caThisMonth || 0;

          clientCAMap[client] = (clientCAMap[client] || 0) + ca;
          equipmentCAMap[equipment] = (equipmentCAMap[equipment] || 0) + ca;
          totalLocationsCount++;
        });
      }

      // Agrégation des locations fermées
      if (monthData.closedLocations) {
        monthData.closedLocations.forEach(location => {
          const client = location.client || 'N/A';
          const equipment = location.designation || 'N/A';
          const ca = location.caConfirmedThisMonth || location.caThisMonth || 0;

          clientCAMap[client] = (clientCAMap[client] || 0) + ca;
          equipmentCAMap[equipment] = (equipmentCAMap[equipment] || 0) + ca;
          totalLocationsCount++;
        });
      }
    });

    // Trier par CA décroissant
    const sortedClients = Object.entries(clientCAMap)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    const sortedEquipment = Object.entries(equipmentCAMap)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    const totalCA = Object.values(clientCAMap).reduce((a, b) => a + b, 0);

    console.log('✅ Agrégation terminée:');
    console.log(`  👥 ${sortedClients.length} clients uniques, CA total: ${totalCA.toFixed(2)}€`);
    console.log(`  🔧 ${sortedEquipment.length} équipements uniques`);
    console.log(`  📦 ${totalLocationsCount} locations au total`);

    return {
      clientLabels: sortedClients.map(c => c.label),
      clientValues: sortedClients.map(c => c.value),
      equipmentLabels: sortedEquipment.map(e => e.label),
      equipmentValues: sortedEquipment.map(e => e.value),
      totalCA: parseFloat(totalCA.toFixed(2)),
      totalLocations: totalLocationsCount
    };
  }
};

export default analyticsService;
