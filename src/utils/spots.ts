import { Spot } from '../types';

// A spot belongs to a day if it is that day's spot or a multi-day spot spanning into it
export function isSpotInDay(spot: Spot, homeDayNumber: number, dayNumber: number) {
  return homeDayNumber === dayNumber
    || (!!spot.endDayNumber && homeDayNumber < dayNumber && spot.endDayNumber >= dayNumber);
}
