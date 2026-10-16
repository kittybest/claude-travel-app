import { useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toPng } from 'html-to-image';
import { useTripContext } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';
import { ExportIcon } from '../ui/Icons';
import SpotMarker from './SpotMarker';
import MapClickHandler from './MapClickHandler';
import FlyToHandler from './FlyToHandler';
import FitViewHandler from './FitViewHandler';
import DayLegend from './DayLegend';
import { isSpotInDay } from '../../utils/spots';

export default function TripMap() {
  const { selectedTrip, selectedDayNumber, activeTab, addingSpot } = useTripContext();
  const containerRef = useRef<HTMLDivElement | null>(null);

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
        style={{ cursor: addingSpot ? 'crosshair' : '' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />
        <FlyToHandler />
        <FitViewHandler />
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
