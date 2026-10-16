import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';
import { ChevronDownIcon, ChevronUpIcon, LayersIcon } from '../ui/Icons';

export default function DayLegend() {
  const { selectedTrip } = useTripContext();
  // Collapsed by default on mobile so the legend does not cover the map
  const [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  if (!selectedTrip) return null;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md px-3 py-1.5 text-xs font-medium text-gray-700 z-[1000]"
        title="Show days"
      >
        <LayersIcon size={13} /> Days <ChevronUpIcon size={12} />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 z-[1000]">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <p className="text-xs font-medium text-gray-700">Days</p>
        <button
          onClick={() => setCollapsed(true)}
          className="p-0.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="Hide days"
        >
          <ChevronDownIcon size={12} />
        </button>
      </div>
      <div className="space-y-1">
        {selectedTrip.days.map(day => (
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
  );
}
