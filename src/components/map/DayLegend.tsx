import { useTripContext } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';

export default function DayLegend() {
  const { selectedTrip } = useTripContext();
  if (!selectedTrip) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 z-[1000]">
      <p className="text-xs font-medium text-gray-700 mb-1.5">Days</p>
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
