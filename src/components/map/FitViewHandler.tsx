import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTripContext } from '../../context/TripContext';
import { Spot } from '../../types';
import { isSpotInDay } from '../../utils/spots';

export default function FitViewHandler() {
  const map = useMap();
  const { selectedTrip, selectedTripId, selectedDayNumber, activeTab } = useTripContext();
  // Latest trip data, read by fitView without making spot edits trigger a refit
  const tripRef = useRef(selectedTrip);
  tripRef.current = selectedTrip;

  const fitView = useCallback(() => {
    const trip = tripRef.current;
    if (!trip) return;
    let spots: Spot[];
    if (activeTab === 'overview') {
      spots = trip.days.flatMap(d => d.spots);
    } else if (activeTab === 'spots') {
      spots = trip.days.flatMap(d => d.spots.filter(s => isSpotInDay(s, d.dayNumber, selectedDayNumber)));
    } else {
      return;
    }
    if (spots.length === 0) return;
    const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, activeTab, selectedDayNumber]);

  useEffect(() => {
    fitView();
  }, [fitView, selectedTripId]);

  useEffect(() => {
    window.addEventListener('refit-view', fitView);
    return () => window.removeEventListener('refit-view', fitView);
  }, [fitView]);

  return null;
}
