import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toPng } from 'html-to-image';
import { useTripContext } from '../../context/TripContext';
import { Spot } from '../../types';
import { getDayColor } from '../../constants/colors';
import { ExportIcon } from '../ui/Icons';
import SpotMarker from './SpotMarker';
import MapClickHandler from './MapClickHandler';
import FlyToHandler from './FlyToHandler';
import DayLegend from './DayLegend';

// A spot belongs to a day if it is that day's spot or a multi-day spot spanning into it
function isSpotInDay(spot: Spot, homeDayNumber: number, dayNumber: number) {
  return homeDayNumber === dayNumber
    || (!!spot.endDayNumber && homeDayNumber < dayNumber && spot.endDayNumber >= dayNumber);
}

export default function TripMap() {
  const { selectedTrip, selectedTripId, selectedDayNumber, activeTab, addingSpot } = useTripContext();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Latest trip data, read by fitView without making spot edits trigger a refit
  const tripRef = useRef(selectedTrip);
  tripRef.current = selectedTrip;

  const fitView = useCallback(() => {
    const trip = tripRef.current;
    if (!mapRef.current || !trip) return;
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
    mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [activeTab, selectedDayNumber]);

  useEffect(() => {
    fitView();
  }, [fitView, selectedTripId]);

  useEffect(() => {
    window.addEventListener('refit-view', fitView);
    return () => window.removeEventListener('refit-view', fitView);
  }, [fitView]);

  const dimOtherDays = activeTab === 'spots';

  const handleExport = useCallback(async () => {
    if (!containerRef.current || !selectedTrip) return;
    try {
      const dataUrl = await toPng(containerRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${selectedTrip.name.replace(/[^a-zA-Z0-9]/g, '_')}_map.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [selectedTrip]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <MapContainer
        center={[35.6762, 139.6503]}
        zoom={3}
        className="w-full h-full"
        ref={mapRef}
        style={{ cursor: addingSpot ? 'crosshair' : '' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        <FlyToHandler />
        {selectedTrip?.days.map(day => {
          // Only include non-multi-day spots in polyline
          const polylineSpots = day.spots.filter(s => !s.endDayNumber);
          const positions = polylineSpots.map(s => [s.lat, s.lng] as [number, number]);
          const dayDimmed = dimOtherDays && day.dayNumber !== selectedDayNumber;
          return (
            <span key={`day-${day.dayNumber}`}>
              {positions.length >= 2 && (
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: getDayColor(day.dayNumber),
                    weight: 2,
                    opacity: dayDimmed ? 0.15 : 0.6,
                    dashArray: '6 4',
                  }}
                />
              )}
              {day.spots.map((spot, idx) => (
                <SpotMarker
                  key={spot.id}
                  spot={spot}
                  dayNumber={day.dayNumber}
                  orderLabel={idx + 1}
                  dayRangeLabel={spot.endDayNumber ? `Day ${day.dayNumber}–${spot.endDayNumber}` : undefined}
                  dimmed={dimOtherDays && !isSpotInDay(spot, day.dayNumber, selectedDayNumber)}
                />
              ))}
            </span>
          );
        })}
      </MapContainer>
      {addingSpot && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs shadow-lg z-[1000]">
          Click on the map to place a spot
        </div>
      )}
      {selectedTrip && (
        <button
          onClick={handleExport}
          className="absolute top-4 right-4 flex items-center gap-1.5 bg-white text-gray-700 px-3 py-1.5 rounded-full shadow-md text-xs hover:bg-gray-50 z-[1000] border border-gray-200 transition-colors"
          title="Export Map"
        >
          <ExportIcon size={13} /> Export
        </button>
      )}
      <DayLegend />
    </div>
  );
}
