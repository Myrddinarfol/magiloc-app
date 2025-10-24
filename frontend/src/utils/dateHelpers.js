import { FRENCH_HOLIDAYS } from './holidays';

// Fonction pour formater une date au format JJ/MM/AAAA
export const formatDateToFrench = (dateStr) => {
  if (!dateStr) return '';

  // Si déjà au format JJ/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Convertir depuis ISO (YYYY-MM-DD) ou objet Date
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Fonction pour convertir date française (JJ/MM/AAAA) vers ISO (YYYY-MM-DD)
export const convertFrenchToISO = (dateStr) => {
  if (!dateStr) return null;

  // Si déjà au format ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr;
  }

  // Convertir depuis JJ/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  return dateStr;
};

// Fonction pour calculer les jours ouvrés (lundi-vendredi, hors jours fériés français)
// IMPORTANT: La date de fin est EXCLUE (convention location: du jour start inclus au jour end exclus)
// Exemple: 25 sept au 9 oct = du 25 sept inclus jusqu'au 9 oct exclu (compte jusqu'au 8 oct)
export const calculateBusinessDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return null;

  // Convertir les dates françaises en ISO si nécessaire
  const startISO = convertFrenchToISO(startDateStr);
  const endISO = convertFrenchToISO(endDateStr);

  const startDate = new Date(startISO);
  const endDate = new Date(endISO);

  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) return null;

  let businessDays = 0;
  const currentDate = new Date(startDate);

  // Boucle jusqu'à endDate INCLUS (donc <= endDate, les deux dates sont incluses)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // Compter seulement si c'est un jour de semaine (1-5) et pas un jour férié
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !FRENCH_HOLIDAYS.includes(dateStr)) {
      businessDays++;
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  console.log(`🗓️ calculateBusinessDays: ${startISO} à ${endISO} = ${businessDays} jours ouvrés`);

  return businessDays;
};

/**
 * Calcule la répartition des jours ouvrés d'une location par mois
 * Utile quand une location chevauche plusieurs mois
 *
 * Exemple: Location du 25/09 au 09/10
 * Retourne: {
 *   "2025-09": 4,  // 25, 26, 29, 30 (sept)
 *   "2025-10": 7   // 1, 2, 3, 6, 7, 8, 9 (oct)
 * }
 */
export const calculateBusinessDaysByMonth = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return {};

  // Convertir les dates françaises en ISO si nécessaire
  const startISO = convertFrenchToISO(startDateStr);
  const endISO = convertFrenchToISO(endDateStr);

  const startDate = new Date(startISO);
  const endDate = new Date(endISO);

  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) return {};

  const monthlyDays = {};
  const currentDate = new Date(startDate);

  // Boucle jusqu'à endDate INCLUS
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // Créer une clé YYYY-MM pour regrouper par mois
    const monthKey = dateStr.substring(0, 7); // Format: "2025-09"

    // Compter seulement si c'est un jour de semaine (1-5) et pas un jour férié
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !FRENCH_HOLIDAYS.includes(dateStr)) {
      monthlyDays[monthKey] = (monthlyDays[monthKey] || 0) + 1;
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  console.log(`📅 calculateBusinessDaysByMonth: ${startISO} à ${endISO}`, monthlyDays);

  return monthlyDays;
};
