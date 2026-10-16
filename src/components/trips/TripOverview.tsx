import { useTripContext } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';

export default function TripOverview() {
  const { selectedTrip, setSelectedDayNumber, setActiveTab } = useTripContext();
  if (!selectedTrip) return null;

  const openDay = (dayNumber: number) => {
    setSelectedDayNumber(dayNumber);
    setActiveTab('spots');
  };

  return (
    <div className="pb-16">
      {selectedTrip.days.map(day => {
        const first = day.spots[0];
        const last = day.spots[day.spots.length - 1];
        return (
          <button
            key={day.dayNumber}
            onClick={() => openDay(day.dayNumber)}
            className="w-full flex items-start gap-2 p-2 rounded hover:bg-gray-50 text-left transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: getDayColor(day.dayNumber) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-800">
                  {day.date.slice(5).replace('-', '/')} (Day{day.dayNumber})
                </p>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {day.spots.length === 0
                    ? 'No spots'
                    : `${day.spots.length} ${day.spots.length === 1 ? 'spot' : 'spots'}`}
                </span>
              </div>
              {first && (
                <p className="text-xs text-gray-500 truncate">
                  {first === last ? first.name : `${first.name} -> ${last.name}`}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
