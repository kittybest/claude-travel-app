import { useState, useCallback, useEffect, useRef } from 'react';
import { Trip, Spot, Expense, Note } from '../types';
import { generateId } from '../utils/id';
import { generateDays } from '../utils/dates';

function getLocalTrips(): Trip[] {
  try {
    const stored = localStorage.getItem('travel-app-trips');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function fetchTrips(): Promise<Trip[]> {
  try {
    const res = await fetch('/api/trips');
    if (res.ok) {
      const { trips } = await res.json();
      const remoteTrips: Trip[] = trips || [];
      if (remoteTrips.length > 0) {
        return remoteTrips;
      }
      // Redis is empty — check localStorage for migration
      const localTrips = getLocalTrips();
      if (localTrips.length > 0) {
        // One-time migration: push localStorage trips to Redis
        await saveTrips(localTrips);
        return localTrips;
      }
      return [];
    }
  } catch {
    // API unavailable — fall back to localStorage
  }
  return getLocalTrips();
}

async function saveTrips(trips: Trip[]): Promise<void> {
  // Always save to localStorage as cache
  localStorage.setItem('travel-app-trips', JSON.stringify(trips));
  try {
    await fetch('/api/trips', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trips }),
    });
  } catch {
    // localStorage is the fallback
  }
}

export function useTrips() {
  const [trips, setTripsState] = useState<Trip[]>([]);
  const [loaded, setLoaded] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load trips from Redis on mount
  useEffect(() => {
    fetchTrips().then(t => {
      setTripsState(t);
      setLoaded(true);
    });
  }, []);

  // Debounced save to Redis whenever trips change (skip initial load)
  const setTrips = useCallback((updater: (prev: Trip[]) => Trip[]) => {
    setTripsState(prev => {
      const next = updater(prev);
      // Debounce saves to avoid excessive API calls
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => saveTrips(next), 300);
      return next;
    });
  }, []);

  const createTrip = useCallback((name: string, startDate: string, endDate: string, defaultCurrency?: string) => {
    const trip: Trip = {
      id: generateId(),
      name,
      startDate,
      endDate,
      days: generateDays(startDate, endDate),
      expenses: [],
      notes: [],
      defaultCurrency: defaultCurrency || 'USD',
    };
    setTrips(prev => [...prev, trip]);
    return trip;
  }, [setTrips]);

  const updateTrip = useCallback((id: string, updates: Partial<Pick<Trip, 'name' | 'startDate' | 'endDate' | 'defaultCurrency'>>) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates };
      if (updates.startDate || updates.endDate) {
        const newDays = generateDays(updated.startDate, updated.endDate);
        updated.days = newDays.map(nd => {
          const existing = t.days.find(d => d.dayNumber === nd.dayNumber);
          return existing ? { ...nd, spots: existing.spots } : nd;
        });
      }
      return updated;
    }));
  }, [setTrips]);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  }, [setTrips]);

  const addSpot = useCallback((tripId: string, dayNumber: number, spot: Omit<Spot, 'id'>) => {
    const newSpot: Spot = { ...spot, id: generateId() };
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        days: t.days.map(d => {
          if (d.dayNumber !== dayNumber) return d;
          return { ...d, spots: [...d.spots, newSpot] };
        }),
      };
    }));
  }, [setTrips]);

  const updateSpot = useCallback((tripId: string, dayNumber: number, spotId: string, updates: Partial<Omit<Spot, 'id'>>) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        days: t.days.map(d => {
          if (d.dayNumber !== dayNumber) return d;
          return {
            ...d,
            spots: d.spots.map(s => s.id === spotId ? { ...s, ...updates } : s),
          };
        }),
      };
    }));
  }, [setTrips]);

  const removeSpot = useCallback((tripId: string, dayNumber: number, spotId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        days: t.days.map(d => {
          if (d.dayNumber !== dayNumber) return d;
          return { ...d, spots: d.spots.filter(s => s.id !== spotId) };
        }),
      };
    }));
  }, [setTrips]);

  const reorderSpots = useCallback((tripId: string, dayNumber: number, fromIndex: number, toIndex: number) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        days: t.days.map(d => {
          if (d.dayNumber !== dayNumber) return d;
          const spots = [...d.spots];
          const [moved] = spots.splice(fromIndex, 1);
          spots.splice(toIndex, 0, moved);
          return { ...d, spots };
        }),
      };
    }));
  }, [setTrips]);

  const moveSpot = useCallback((tripId: string, fromDay: number, toDay: number, spotId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const spot = t.days.find(d => d.dayNumber === fromDay)?.spots.find(s => s.id === spotId);
      if (!spot) return t;
      return {
        ...t,
        days: t.days.map(d => {
          if (d.dayNumber === fromDay) return { ...d, spots: d.spots.filter(s => s.id !== spotId) };
          if (d.dayNumber === toDay) return { ...d, spots: [...d.spots, spot] };
          return d;
        }),
      };
    }));
  }, [setTrips]);

  const addExpense = useCallback((tripId: string, expense: Omit<Expense, 'id'>) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, expenses: [...(t.expenses || []), { ...expense, id: generateId() }] };
    }));
  }, [setTrips]);

  const updateExpense = useCallback((tripId: string, expenseId: string, updates: Partial<Omit<Expense, 'id'>>) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        expenses: (t.expenses || []).map(e => e.id === expenseId ? { ...e, ...updates } : e),
      };
    }));
  }, [setTrips]);

  const removeExpense = useCallback((tripId: string, expenseId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, expenses: (t.expenses || []).filter(e => e.id !== expenseId) };
    }));
  }, [setTrips]);

  const addNote = useCallback((tripId: string, note: Omit<Note, 'id'>) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, notes: [...(t.notes || []), { ...note, id: generateId() }] };
    }));
  }, [setTrips]);

  const updateNote = useCallback((tripId: string, noteId: string, updates: Partial<Omit<Note, 'id'>>) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        notes: (t.notes || []).map(n => n.id === noteId ? { ...n, ...updates } : n),
      };
    }));
  }, [setTrips]);

  const removeNote = useCallback((tripId: string, noteId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, notes: (t.notes || []).filter(n => n.id !== noteId) };
    }));
  }, [setTrips]);

  return {
    trips, loaded, createTrip, updateTrip, deleteTrip,
    addSpot, updateSpot, removeSpot, reorderSpots, moveSpot,
    addExpense, updateExpense, removeExpense,
    addNote, updateNote, removeNote,
  };
}
