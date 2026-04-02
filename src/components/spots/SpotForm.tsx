import { useState, useEffect } from 'react';
import { SpotCategory } from '../../types';
import { useTripContext } from '../../context/TripContext';
import { parseGoogleMapsUrl } from '../../utils/parseGoogleMapsUrl';
import { SPOT_CATEGORIES, CURRENCIES } from '../../constants/categories';
import { AddIcon, CancelIcon } from '../ui/Icons';
import PlaceSearch from './PlaceSearch';
import StarRating from './StarRating';

export default function SpotForm() {
  const { selectedTrip, selectedDayNumber, addSpot, setAddingSpot } = useTripContext();
  const [name, setName] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<SpotCategory | ''>('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState(selectedTrip?.defaultCurrency || 'USD');
  const [mapsLink, setMapsLink] = useState('');
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setLat(e.detail.lat);
      setLng(e.detail.lng);
      setLinkError('');
      if (!name) setName(`Spot at ${e.detail.lat.toFixed(4)}, ${e.detail.lng.toFixed(4)}`);
    };
    window.addEventListener('map-click', handler as EventListener);
    return () => window.removeEventListener('map-click', handler as EventListener);
  }, [name]);

  const handleLinkChange = (value: string) => {
    setMapsLink(value);
    setLinkError('');
    if (!value) return;
    const coords = parseGoogleMapsUrl(value);
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
      window.dispatchEvent(new CustomEvent('fly-to', { detail: coords }));
    } else if (value.includes('google.com/maps') || value.includes('goo.gl') || value.includes('maps.app')) {
      setLinkError('Could not extract coordinates. Try the full URL (not a shortened link).');
    }
  };

  const handlePlaceSelect = (result: { name: string; lat: number; lng: number }) => {
    setName(result.name);
    setLat(result.lat);
    setLng(result.lng);
    window.dispatchEvent(new CustomEvent('fly-to', { detail: { lat: result.lat, lng: result.lng } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !name || lat === null || lng === null) return;
    addSpot(selectedTrip.id, selectedDayNumber, {
      name, lat, lng,
      notes: notes || undefined,
      rating: rating || undefined,
      category: category || undefined,
      price: price ? parseFloat(price) : undefined,
      currency: price ? currency : undefined,
      googleMapsUrl: mapsLink || undefined,
    });
    setAddingSpot(false);
  };

  const hasLocation = lat !== null && lng !== null;

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
      <PlaceSearch onSelect={handlePlaceSelect} />
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-[10px] text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
      <div>
        <input
          type="text" value={mapsLink} onChange={e => handleLinkChange(e.target.value)}
          placeholder="Paste Google Maps link..."
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {linkError && <p className="text-[10px] text-red-500 mt-1">{linkError}</p>}
      </div>
      {hasLocation && (
        <p className="text-[10px] text-green-600">Location set: {lat!.toFixed(4)}, {lng!.toFixed(4)}</p>
      )}
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Spot name" required
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select value={category} onChange={e => setCategory(e.target.value as SpotCategory | '')}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="">Category (optional)</option>
        {SPOT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
      </select>
      <div className="flex gap-2">
        <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
          placeholder="Price (optional)"
          className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          className="w-20 border border-gray-300 rounded px-1 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Rating:</span>
        <StarRating value={rating} onChange={setRating} size="md" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={!hasLocation || !name}
          className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white rounded-full py-1.5 text-xs hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <AddIcon size={12} /> Add Spot
        </button>
        <button type="button" onClick={() => setAddingSpot(false)}
          className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-600 rounded-full py-1.5 text-xs hover:bg-gray-300 transition-colors">
          <CancelIcon size={12} /> Cancel
        </button>
      </div>
      <p className="text-[10px] text-gray-400 text-center">Search, paste a map link, or click on the map</p>
    </form>
  );
}
