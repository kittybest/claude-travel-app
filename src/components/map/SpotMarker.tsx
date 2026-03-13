import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Spot } from '../../types';
import { getDayColor } from '../../constants/colors';
import { getCategoryIcon } from '../../constants/categories';

interface Props {
  spot: Spot;
  dayNumber: number;
  orderLabel?: number;
}

function createColoredIcon(color: string, label?: number) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${label ? 20 : 14}px;
      height: ${label ? 20 : 14}px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
    ">${label ?? ''}</div>`,
    iconSize: [label ? 20 : 14, label ? 20 : 14],
    iconAnchor: [label ? 10 : 7, label ? 10 : 7],
    popupAnchor: [0, label ? -12 : -10],
  });
}

function renderStars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export default function SpotMarker({ spot, dayNumber, orderLabel }: Props) {
  const color = getDayColor(dayNumber);
  const icon = createColoredIcon(color, orderLabel);

  return (
    <Marker position={[spot.lat, spot.lng]} icon={icon}>
      <Popup>
        <div className="text-sm">
          <strong>{spot.category ? getCategoryIcon(spot.category) + ' ' : ''}{spot.name}</strong>
          {spot.rating ? (
            <p style={{ color: '#facc15', margin: '2px 0' }}>{renderStars(spot.rating)}</p>
          ) : null}
          {spot.price != null && (
            <p style={{ color: '#6b7280', fontSize: '11px', margin: '2px 0' }}>{spot.currency} {spot.price.toFixed(2)}</p>
          )}
          {spot.notes && <p className="text-gray-500 text-xs mt-1">{spot.notes}</p>}
          <p className="text-gray-400 text-[10px] mt-1">Day {dayNumber}</p>
          <a
            href={spot.googleMapsUrl || `https://www.google.com/maps?q=${spot.lat},${spot.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', fontSize: '10px', textDecoration: 'underline' }}
          >
            Open in Google Maps
          </a>
        </div>
      </Popup>
    </Marker>
  );
}
