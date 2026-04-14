import { useState } from 'react';
import { Spot, SpotCategory } from '../../types';
import { useTripContext } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';
import { parseGoogleMapsUrl } from '../../utils/parseGoogleMapsUrl';
import { SPOT_CATEGORIES, CURRENCIES, getCategoryIcon } from '../../constants/categories';
import { useAuth } from '../../context/AuthContext';
import { EditIcon, DeleteIcon, SaveIcon, CancelIcon, ExternalLinkIcon, CopyIcon } from '../ui/Icons';
import StarRating from './StarRating';

interface Props {
  spot: Spot;
  dayNumber: number;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  isReference?: boolean;
  homeDayNumber?: number;
}

export default function SpotItem({ spot, dayNumber, index, onDragStart, onDragOver, onDragEnd, isDragOver, isReference, homeDayNumber }: Props) {
  const { selectedTrip, addSpot, removeSpot, updateSpot, moveSpot } = useTripContext();
  const { isAuthorized } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(spot.name);
  const [notes, setNotes] = useState(spot.notes ?? '');
  const [rating, setRating] = useState(spot.rating ?? 0);
  const [category, setCategory] = useState<SpotCategory | ''>(spot.category ?? '');
  const [price, setPrice] = useState(spot.price?.toString() ?? '');
  const [currency, setCurrency] = useState(spot.currency ?? selectedTrip?.defaultCurrency ?? 'USD');
  const [mapsLink, setMapsLink] = useState('');
  const [newLat, setNewLat] = useState<number | null>(null);
  const [newLng, setNewLng] = useState<number | null>(null);
  const [linkError, setLinkError] = useState('');
  const [moveToDayNumber, setMoveToDayNumber] = useState<number>(dayNumber);
  const [endDay, setEndDay] = useState<string>(spot.endDayNumber?.toString() ?? '');
  const actualDayNumber = homeDayNumber ?? dayNumber;
  const color = getDayColor(actualDayNumber);
  const dayRangeLabel = spot.endDayNumber ? `Day ${actualDayNumber}–${spot.endDayNumber}` : null;

  if (!selectedTrip) return null;

  const handleLinkChange = (value: string) => {
    setMapsLink(value);
    setLinkError('');
    if (!value) { setNewLat(null); setNewLng(null); return; }
    const coords = parseGoogleMapsUrl(value);
    if (coords) { setNewLat(coords.lat); setNewLng(coords.lng); }
    else if (value.includes('google.com/maps') || value.includes('goo.gl') || value.includes('maps.app')) {
      setLinkError('Could not extract coordinates. Try the full URL.');
    }
  };

  const handleSave = () => {
    const updates: Partial<Omit<Spot, 'id'>> = {
      name,
      notes: notes || undefined,
      rating: rating || undefined,
      category: category || undefined,
      price: price ? parseFloat(price) : undefined,
      currency: price ? currency : undefined,
      googleMapsUrl: mapsLink || spot.googleMapsUrl || undefined,
      endDayNumber: endDay ? parseInt(endDay) : undefined,
    };
    if (newLat !== null && newLng !== null) {
      updates.lat = newLat;
      updates.lng = newLng;
    }
    const saveDayNumber = isReference ? actualDayNumber : dayNumber;
    updateSpot(selectedTrip.id, saveDayNumber, spot.id, updates);
    if (!isReference && moveToDayNumber !== dayNumber) {
      moveSpot(selectedTrip.id, dayNumber, moveToDayNumber, spot.id);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="p-2 border border-gray-200 rounded text-xs space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Spot name"
          className="w-full border border-gray-300 rounded px-2 py-1" />
        <select value={category} onChange={e => setCategory(e.target.value as SpotCategory | '')}
          className="w-full border border-gray-300 rounded px-2 py-1 bg-white">
          <option value="">Category (optional)</option>
          {SPOT_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)}
            placeholder="Price" className="flex-1 border border-gray-300 rounded px-2 py-1" />
          <select value={currency} onChange={e => setCurrency(e.target.value)}
            className="w-16 border border-gray-300 rounded px-1 py-1 bg-white">
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
          className="w-full border border-gray-300 rounded px-2 py-1" />
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Rating:</span>
          <StarRating value={rating} onChange={setRating} size="sm" />
        </div>
        <div>
          <input value={mapsLink} onChange={e => handleLinkChange(e.target.value)}
            placeholder="New map link (optional)" className="w-full border border-gray-300 rounded px-2 py-1" />
          {linkError && <p className="text-[10px] text-red-500 mt-0.5">{linkError}</p>}
          {newLat !== null && newLng !== null && (
            <p className="text-[10px] text-green-600 mt-0.5">New location: {newLat.toFixed(4)}, {newLng.toFixed(4)}</p>
          )}
        </div>
        {!isReference && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Move to:</span>
            <select value={moveToDayNumber} onChange={e => setMoveToDayNumber(Number(e.target.value))}
              className="border border-gray-300 rounded px-1 py-0.5">
              {selectedTrip.days.map(d => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber}{d.dayNumber === dayNumber ? ' (current)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Span to:</span>
          <select value={endDay} onChange={e => setEndDay(e.target.value)}
            className="border border-gray-300 rounded px-1 py-0.5">
            <option value="">Single day</option>
            {selectedTrip.days
              .filter(d => d.dayNumber > actualDayNumber)
              .map(d => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber} ({actualDayNumber}–{d.dayNumber})
                </option>
              ))}
          </select>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleSave}
            className="flex items-center gap-1 bg-cyan-500 text-white px-2.5 py-1 rounded-full hover:bg-cyan-600 transition-colors"
            title="Save"
          >
            <SaveIcon size={11} /> Save
          </button>
          <button onClick={() => setEditing(false)}
            className="flex items-center gap-1 bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-300 transition-colors"
            title="Cancel"
          >
            <CancelIcon size={11} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={isAuthorized && !isReference}
      onDragStart={() => isAuthorized && !isReference && onDragStart(index)}
      onDragOver={e => isAuthorized && !isReference && onDragOver(e, index)}
      onDragEnd={isAuthorized && !isReference ? onDragEnd : undefined}
      className={`flex items-start gap-2 p-2 rounded hover:bg-gray-50 group ${isAuthorized && !isReference ? 'cursor-grab active:cursor-grabbing' : ''} transition-all ${
        isDragOver ? 'border-t-2 border-blue-400' : 'border-t-2 border-transparent'
      } ${isReference ? 'opacity-50' : ''}`}
    >
      {!isReference && <span className="text-gray-300 text-xs mt-0.5 select-none">::</span>}
      {isReference
        ? <span className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0 border-2" style={{ borderColor: color }} />
        : <span className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: color }} />
      }
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {spot.category && <span className="text-xs">{getCategoryIcon(spot.category)}</span>}
          <p className={`text-sm truncate ${isReference ? 'text-gray-500' : 'text-gray-800'}`}>{spot.name}</p>
          {dayRangeLabel && (
            <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full whitespace-nowrap">{dayRangeLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {spot.rating ? <StarRating value={spot.rating} size="sm" /> : null}
          {spot.price != null && (
            <span className="text-[10px] text-gray-500">{spot.currency} {spot.price.toFixed(2)}</span>
          )}
        </div>
        {spot.notes && <p className="text-xs text-gray-400 truncate">{spot.notes}</p>}
        <a
          href={spot.googleMapsUrl || `https://www.google.com/maps?q=${spot.lat},${spot.lng}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-blue-600"
          onClick={e => e.stopPropagation()}
        >
          <ExternalLinkIcon size={9} /> Google Maps
        </a>
      </div>
      {isAuthorized && (
        <div className="hidden group-hover:flex gap-1">
          <button
            onClick={() => {
              setEndDay(spot.endDayNumber?.toString() ?? '');
              setEditing(true);
            }}
            className="p-1 rounded-full bg-cyan-50 text-cyan-500 hover:bg-cyan-100 transition-colors"
            title="Edit"
          >
            <EditIcon size={12} />
          </button>
          <button
            onClick={() => addSpot(selectedTrip.id, dayNumber, {
              name: spot.name,
              lat: spot.lat,
              lng: spot.lng,
              notes: spot.notes,
              rating: spot.rating,
              category: spot.category,
              price: spot.price,
              currency: spot.currency,
              googleMapsUrl: spot.googleMapsUrl,
            })}
            className="p-1 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
            title="Copy to this day"
          >
            <CopyIcon size={12} />
          </button>
          {!isReference && (
            <button
              onClick={() => removeSpot(selectedTrip.id, dayNumber, spot.id)}
              className="p-1 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <DeleteIcon size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
