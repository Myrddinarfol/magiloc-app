/**
 * Utilitaires pour gestion des dates (français ↔ ISO)
 * Centralisé pour éviter la duplication
 */

/**
 * Convertir date française DD/MM/YYYY vers ISO YYYY-MM-DD
 * Gère plusieurs formats d'entrée:
 * - "01/12/2025" → "2025-12-01"
 * - "2025-12-01" → "2025-12-01" (already ISO)
 * - "2025-12-01T10:30:00" → "2025-12-01" (ISO datetime)
 */
export function convertFrenchDateToISO(dateStr) {
  if (!dateStr) return null;

  // Si c'est déjà au format ISO complet (YYYY-MM-DDTHH:MM:SS), extraire la date
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
    return dateStr.split('T')[0];
  }

  // Si c'est déjà au format ISO date simple (YYYY-MM-DD), retourner tel quel
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Si c'est au format français DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  // Essayer de parser comme date JavaScript
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Erreur conversion date:', dateStr, e.message);
  }

  return dateStr;
}

/**
 * Convertir date ISO vers format français DD/MM/YYYY
 * Gère plusieurs formats d'entrée:
 * - "2025-12-01" → "01/12/2025"
 * - "2025-12-01T10:30:00" → "01/12/2025"
 * - "01/12/2025" → "01/12/2025" (already French)
 */
export function formatDateToFrench(dateStr) {
  if (!dateStr) return null;

  // Si déjà au format français
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  // Convertir depuis ISO ou Date object
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Calculer le nombre de jours ouvrés entre deux dates
 * Exclut: samedi, dimanche, jours fériés français
 */
export function calculateBusinessDays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) return null;

  // Jours fériés français 2025-2026
  const holidays = [
    '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09',
    '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
    '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25',
    '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25'
  ];

  let businessDays = 0;
  const currentDate = new Date(startDate);

  // IMPORTANT: La date de fin est EXCLUE (convention location: du jour start inclus au jour end exclus)
  // Exemple: 25 sept au 9 oct = du 25 sept inclus jusqu'au 9 oct exclu (compte jusqu'au 8 oct)
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // Compter seulement si c'est un jour de semaine (1-5) et pas un jour férié
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}
