import { Trip } from '../../types';

interface Props {
  trip: Trip;
  selected: boolean;
  onSelect: () => void;
}

export default function TripCard({ trip, selected, onSelect }: Props) {
  const spotCount = trip.days.reduce((sum, d) => sum + d.spots.length, 0);

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer border transition-colors ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <h3 className="font-medium text-gray-900">{trip.name}</h3>
      <p className="text-xs text-gray-500 mt-1">
        {trip.startDate} - {trip.endDate}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {trip.days.length} days, {spotCount} spots
      </p>
    </div>
  );
}
