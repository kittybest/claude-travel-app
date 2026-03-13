import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { AddIcon } from '../ui/Icons';
import SpotItem from '../spots/SpotItem';
import SpotForm from '../spots/SpotForm';

export default function DaySpotList() {
  const { selectedTrip, selectedDayNumber, addingSpot, setAddingSpot, reorderSpots } = useTripContext();
  const { isAuthorized } = useAuth();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!selectedTrip) return null;

  const day = selectedTrip.days.find(d => d.dayNumber === selectedDayNumber);
  if (!day) return null;

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      reorderSpots(selectedTrip.id, selectedDayNumber, dragIndex, dragOverIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          Spots ({day.spots.length})
        </h3>
        {isAuthorized && !addingSpot && (
          <button
            onClick={() => setAddingSpot(true)}
            className="flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full hover:bg-green-600 transition-colors"
            title="Add Spot"
          >
            <AddIcon size={11} />
            <span>Add Spot</span>
          </button>
        )}
      </div>
      {addingSpot && <SpotForm />}
      {day.spots.length === 0 && !addingSpot ? (
        <p className="text-gray-400 text-xs text-center py-4">
          No spots yet. Click "Add Spot" or click on the map.
        </p>
      ) : (
        <div>
          {day.spots.map((spot, index) => (
            <SpotItem
              key={spot.id}
              spot={spot}
              dayNumber={selectedDayNumber}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              isDragOver={dragOverIndex === index && dragIndex !== index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
