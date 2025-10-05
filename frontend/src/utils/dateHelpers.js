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
export const calculateBusinessDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return null;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) return null;

  let businessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // Compter seulement si c'est un jour de semaine (1-5) et pas un jour férié
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !FRENCH_HOLIDAYS.includes(dateStr)) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
};
