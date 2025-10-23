import { calculateBusinessDays } from './utils/dateHelpers.js';

// Test case: palan manuel from 25 Sept to 9 Oct should be 9 days
// Friday 25 Sept, Monday 29 Sept, Tues 30 Sept, Wed 1 Oct, Thurs 2 Oct,
// Fri 3 Oct, Mon 6 Oct, Tues 7 Oct, Wed 8 Oct = 9 business days (NOT including 9 Oct)

const result = calculateBusinessDays('2025-09-25', '2025-10-09');
console.log(`Résultat: ${result} jours ouvrés (expected: 9)`);

// Test with Date objects
const start = new Date('2025-09-25');
const end = new Date('2025-10-09');

console.log(`\nDates:`);
console.log(`  Début: ${start.toISOString()} (${start.toLocaleDateString('fr-FR')})`);
console.log(`  Fin:   ${end.toISOString()} (${end.toLocaleDateString('fr-FR')})`);

// Manually count
let count = 0;
const current = new Date(start);
const holidays = [
  '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09',
  '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25'
];

console.log(`\nCompte manuel:`);
while (current < end) {
  const day = current.getDay();
  const dateStr = current.toISOString().split('T')[0];
  const dayName = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][day];

  if (day !== 0 && day !== 6 && !holidays.includes(dateStr)) {
    count++;
    console.log(`  ${dateStr} (${dayName}) ✓`);
  } else {
    const reason = day === 0 || day === 6 ? 'WE' : 'Férié';
    console.log(`  ${dateStr} (${dayName}) ✗ ${reason}`);
  }

  current.setDate(current.getDate() + 1);
}

console.log(`\nTotal manuel: ${count} jours ouvrés`);
process.exit(0);
