import { createContext, useContext, useState, ReactNode } from 'react';
import { Trip, Spot, Expense, Note } from '../types';
import { useTrips } from '../hooks/useTrips';

interface TripContextType {
  trips: Trip[];
  loaded: boolean;
  selectedTripId: string | null;
  selectedDayNumber: number;
  addingSpot: boolean;
  setSelectedTripId: (id: string | null) => void;
  setSelectedDayNumber: (day: number) => void;
  setAddingSpot: (adding: boolean) => void;
  createTrip: (name: string, startDate: string, endDate: string, defaultCurrency?: string) => Trip;
  updateTrip: (id: string, updates: Partial<Pick<Trip, 'name' | 'startDate' | 'endDate' | 'defaultCurrency'>>) => void;
  deleteTrip: (id: string) => void;
  addSpot: (tripId: string, dayNumber: number, spot: Omit<Spot, 'id'>) => void;
  updateSpot: (tripId: string, dayNumber: number, spotId: string, updates: Partial<Omit<Spot, 'id'>>) => void;
  removeSpot: (tripId: string, dayNumber: number, spotId: string) => void;
  reorderSpots: (tripId: string, dayNumber: number, fromIndex: number, toIndex: number) => void;
  moveSpot: (tripId: string, fromDay: number, toDay: number, spotId: string) => void;
  addExpense: (tripId: string, expense: Omit<Expense, 'id'>) => void;
  updateExpense: (tripId: string, expenseId: string, updates: Partial<Omit<Expense, 'id'>>) => void;
  removeExpense: (tripId: string, expenseId: string) => void;
  addNote: (tripId: string, note: Omit<Note, 'id'>) => void;
  updateNote: (tripId: string, noteId: string, updates: Partial<Omit<Note, 'id'>>) => void;
  removeNote: (tripId: string, noteId: string) => void;
  selectedTrip: Trip | undefined;
}

const TripContext = createContext<TripContextType | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const {
    trips, loaded, createTrip, updateTrip, deleteTrip,
    addSpot, updateSpot, removeSpot, reorderSpots, moveSpot,
    addExpense, updateExpense, removeExpense,
    addNote, updateNote, removeNote,
  } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [addingSpot, setAddingSpot] = useState(false);

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <TripContext.Provider value={{
      trips, loaded, selectedTripId, selectedDayNumber, addingSpot,
      setSelectedTripId, setSelectedDayNumber, setAddingSpot,
      createTrip, updateTrip, deleteTrip,
      addSpot, updateSpot, removeSpot, reorderSpots, moveSpot,
      addExpense, updateExpense, removeExpense,
      addNote, updateNote, removeNote,
      selectedTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
}
