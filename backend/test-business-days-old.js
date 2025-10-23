// Test the OLD algorithm (with <= instead of <)

const holidays = [
  '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29', '2025-06-09',
  '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25'
];

function calculateBusinessDaysOld(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  let businessDays = 0;
  const currentDate = new Date(startDate);

  // OLD: Using <= (inclusive on both ends)
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

function calculateBusinessDaysNew(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  let businessDays = 0;
  const currentDate = new Date(startDate);

  // NEW: Using < (exclusive on end)
  while (currentDate < endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
      businessDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return businessDays;
}

console.log('Test case: 2025-09-25 to 2025-10-09\n');
console.log(`OLD algorithm (<=): ${calculateBusinessDaysOld('2025-09-25', '2025-10-09')} days`);
console.log(`NEW algorithm (<):  ${calculateBusinessDaysNew('2025-09-25', '2025-10-09')} days`);

// So if OLD was showing 11, then:
// <= would count: 25, 26, 29, 30, 1, 2, 3, 6, 7, 8, 9 = 11 days
// < would count:  25, 26, 29, 30, 1, 2, 3, 6, 7, 8 = 10 days (we already know this is correct)

console.log('\nDifference: 11 -> 10 (reduced by 1 day)\n');
console.log('The 9th day in the period would be October 9 (Thursday)\n');
process.exit(0);
