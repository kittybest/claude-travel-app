import { useState } from 'react';
import { Trip } from '../../types';
import { getDayColor } from '../../constants/colors';
import { getCategoryIcon } from '../../constants/categories';
import { BackIcon, ExternalLinkIcon } from '../ui/Icons';
import StarRating from '../spots/StarRating';

interface Props {
  trip: Trip;
  onClose: () => void;
}

export default function SharedTripView({ trip, onClose }: Props) {
  const [selectedDay, setSelectedDay] = useState(1);
  const day = trip.days.find(d => d.dayNumber === selectedDay);

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onClose}
          className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          title="My Trips"
        >
          <BackIcon size={14} />
        </button>
        <h2 className="text-lg font-bold text-gray-900 flex-1 truncate">{trip.name}</h2>
        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Shared</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{trip.startDate} - {trip.endDate}</p>
      <div className="flex gap-1 overflow-x-auto pb-1 mb-3">
        {trip.days.map(d => {
          const color = getDayColor(d.dayNumber);
          const isActive = d.dayNumber === selectedDay;
          return (
            <button
              key={d.dayNumber}
              onClick={() => setSelectedDay(d.dayNumber)}
              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? 'text-white shadow-sm' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
              style={isActive ? { backgroundColor: color } : undefined}
            >
              Day {d.dayNumber}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto">
        {day && day.spots.length > 0 ? (
          <div className="space-y-1">
            {day.spots.map((spot, idx) => (
              <div key={spot.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: getDayColor(day.dayNumber) }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {spot.category && <span className="text-xs">{getCategoryIcon(spot.category)}</span>}
                    <p className="text-sm text-gray-800 truncate">{spot.name}</p>
                  </div>
                  {spot.rating ? <StarRating value={spot.rating} size="sm" /> : null}
                  {spot.notes && <p className="text-xs text-gray-400 truncate">{spot.notes}</p>}
                </div>
                <a
                  href={`https://www.google.com/maps?q=${spot.lat},${spot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  title="Open in Google Maps"
                >
                  <ExternalLinkIcon size={11} />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-xs text-center py-4">No spots for this day.</p>
        )}
      </div>
    </div>
  );
}
