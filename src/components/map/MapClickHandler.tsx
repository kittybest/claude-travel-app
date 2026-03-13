import { useMapEvents } from 'react-leaflet';
import { useTripContext } from '../../context/TripContext';

export default function MapClickHandler() {
  const { addingSpot } = useTripContext();

  useMapEvents({
    click(e) {
      if (addingSpot) {
        window.dispatchEvent(
          new CustomEvent('map-click', {
            detail: { lat: e.latlng.lat, lng: e.latlng.lng },
          })
        );
      }
    },
  });

  return null;
}
