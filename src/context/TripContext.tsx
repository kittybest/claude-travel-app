import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip, Day, Spot, Expense, Note } from '../types';
import { useTrips } from '../hooks/useTrips';
import { useAuth } from './AuthContext';

export type TripTab = 'overview' | 'spots' | 'expenses' | 'notes';

interface TripContextType {
  trips: Trip[];
  loaded: boolean;
  selectedTripId: string | null;
  selectedDayNumber: number;
  addingSpot: boolean;
  activeTab: TripTab;
  overviewExpanded: boolean;
  readOnly: boolean;
  setSelectedTripId: (id: string | null) => void;
  setSelectedDayNumber: (day: number) => void;
  setAddingSpot: (adding: boolean) => void;
  setActiveTab: (tab: TripTab) => void;
  setOverviewExpanded: (expanded: boolean) => void;
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
  updateDay: (tripId: string, dayNumber: number, updates: Pick<Day, 'title' | 'journal'>) => void;
  selectedTrip: Trip | undefined;
}

const TripContext = createContext<TripContextType | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const { isAuthorized } = useAuth();
  const {
    trips, loaded, createTrip, updateTrip, deleteTrip,
    addSpot, updateSpot, removeSpot, reorderSpots, moveSpot,
    addExpense, updateExpense, removeExpense,
    addNote, updateNote, removeNote,
    updateDay,
  } = useTrips(isAuthorized);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [addingSpot, setAddingSpot] = useState(false);
  const [activeTab, setActiveTab] = useState<TripTab>('overview');
  const [overviewExpanded, setOverviewExpanded] = useState(false);

  // Trips are cleared on logout, so drop the selection too
  useEffect(() => {
    if (!isAuthorized) setSelectedTripId(null);
  }, [isAuthorized]);

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  return (
    <TripContext.Provider value={{
      trips, loaded, selectedTripId, selectedDayNumber, addingSpot, activeTab, overviewExpanded, readOnly: false,
      setSelectedTripId, setSelectedDayNumber, setAddingSpot, setActiveTab, setOverviewExpanded,
      createTrip, updateTrip, deleteTrip,
      addSpot, updateSpot, removeSpot, reorderSpots, moveSpot,
      addExpense, updateExpense, removeExpense,
      addNote, updateNote, removeNote,
      updateDay,
      selectedTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
}

const noop = () => {};

// Read-only context for a trip opened from a share link
export function SharedTripProvider({ trip, children }: { trip: Trip; children: ReactNode }) {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<TripTab>('overview');
  const [overviewExpanded, setOverviewExpanded] = useState(false);

  return (
    <TripContext.Provider value={{
      trips: [trip], loaded: true, selectedTripId: trip.id, selectedDayNumber, addingSpot: false, activeTab, overviewExpanded, readOnly: true,
      setSelectedTripId: noop, setSelectedDayNumber, setAddingSpot: noop, setActiveTab, setOverviewExpanded,
      createTrip: () => trip, updateTrip: noop, deleteTrip: noop,
      addSpot: noop, updateSpot: noop, removeSpot: noop, reorderSpots: noop, moveSpot: noop,
      addExpense: noop, updateExpense: noop, removeExpense: noop,
      addNote: noop, updateNote: noop, removeNote: noop,
      updateDay: noop,
      selectedTrip: trip,
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

export function useCanEdit() {
  const { isAuthorized } = useAuth();
  const { readOnly } = useTripContext();
  return isAuthorized && !readOnly;
}
