import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toPng } from 'html-to-image';
import { useTripContext } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';
import { ExportIcon } from '../ui/Icons';
import SpotMarker from './SpotMarker';
import MapClickHandler from './MapClickHandler';
import FlyToHandler from './FlyToHandler';
import DayLegend from './DayLegend';

export default function TripMap() {
  const { selectedTrip, addingSpot } = useTripContext();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current || !selectedTrip) return;
    const allSpots = selectedTrip.days.flatMap(d => d.spots);
    if (allSpots.length === 0) return;
    const bounds = L.latLngBounds(allSpots.map(s => [s.lat, s.lng]));
    mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [selectedTrip]);

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
          const positions = day.spots.map(s => [s.lat, s.lng] as [number, number]);
          return (
            <span key={`day-${day.dayNumber}`}>
              {positions.length >= 2 && (
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: getDayColor(day.dayNumber),
                    weight: 2,
                    opacity: 0.6,
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
