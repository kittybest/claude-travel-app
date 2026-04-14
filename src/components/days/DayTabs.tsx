import { useTripContext } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';

export default function DayTabs() {
  const { selectedTrip, selectedDayNumber, setSelectedDayNumber } = useTripContext();
  if (!selectedTrip) return null;

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {selectedTrip.days.map(day => {
        const color = getDayColor(day.dayNumber);
        const isActive = day.dayNumber === selectedDayNumber;
        return (
          <button
            key={day.dayNumber}
            onClick={() => setSelectedDayNumber(day.dayNumber)}
            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
              isActive ? 'text-white shadow-sm' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
            style={isActive ? { backgroundColor: color } : undefined}
          >
            {day.date.slice(5).replace('-', '/')} (Day{day.dayNumber})
          </button>
        );
      })}
    </div>
  );
}
