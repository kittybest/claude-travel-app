import { Spot } from '../types';
import type { TripTab } from '../context/TripContext';

// A spot belongs to a day if it is that day's spot or a multi-day spot spanning into it
export function isSpotInDay(spot: Spot, homeDayNumber: number, dayNumber: number) {
  return homeDayNumber === dayNumber
    || (!!spot.endDayNumber && homeDayNumber < dayNumber && spot.endDayNumber >= dayNumber);
}

// The day the map focuses on, or null to show the whole trip (or leave the map as is)
export function getFocusedDay(activeTab: TripTab, overviewExpanded: boolean, selectedDayNumber: number) {
  return activeTab === 'spots' || (activeTab === 'overview' && overviewExpanded) ? selectedDayNumber : null;
}
