import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function FlyToHandler() {
  const map = useMap();

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      map.flyTo([e.detail.lat, e.detail.lng], 15, { duration: 1 });
    };
    window.addEventListener('fly-to', handler as EventListener);
    return () => window.removeEventListener('fly-to', handler as EventListener);
  }, [map]);

  return null;
}
