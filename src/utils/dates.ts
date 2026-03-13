import { Day } from '../types';

export function generateDays(startDate: string, endDate: string): Day[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: Day[] = [];
  let dayNumber = 1;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({
      dayNumber,
      date: d.toISOString().split('T')[0],
      spots: [],
    });
    dayNumber++;
  }

  return days;
}
