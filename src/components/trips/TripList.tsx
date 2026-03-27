import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { AddIcon } from '../ui/Icons';
import TripCard from './TripCard';
import TripForm from './TripForm';

export default function TripList() {
  const { trips, loaded, selectedTripId, setSelectedTripId, setSelectedDayNumber } = useTripContext();
  const { isAuthorized } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedTripId(id);
    setSelectedDayNumber(1);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">My Trips</h1>
        {isAuthorized && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full hover:bg-green-600 transition-colors"
            title="New Trip"
          >
            <AddIcon size={12} />
            <span>New Trip</span>
          </button>
        )}
      </div>
      {!loaded ? (
        <p className="text-gray-400 text-sm text-center py-8">Loading trips...</p>
      ) : trips.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No trips yet.</p>
      ) : (
        <div className="space-y-2">
          {trips.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              selected={trip.id === selectedTripId}
              onSelect={() => handleSelect(trip.id)}
            />
          ))}
        </div>
      )}
      {showForm && <TripForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
