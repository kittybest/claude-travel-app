import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trip } from '../../types';
import { getDayColor } from '../../constants/colors';
import SpotMarker from './SpotMarker';

interface Props {
  trip: Trip;
}

export default function SharedTripMap({ trip }: Props) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const allSpots = trip.days.flatMap(d => d.spots);
    if (allSpots.length === 0) return;
    const bounds = L.latLngBounds(allSpots.map(s => [s.lat, s.lng]));
    mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [trip]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[35.6762, 139.6503]}
        zoom={3}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trip.days.map(day => {
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
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 z-[1000]">
        <p className="text-xs font-medium text-gray-700 mb-1.5">Days</p>
        <div className="space-y-1">
          {trip.days.map(day => (
            <div key={day.dayNumber} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getDayColor(day.dayNumber) }}
              />
              <span className="text-[11px] text-gray-600">
                Day {day.dayNumber} ({day.spots.length})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
