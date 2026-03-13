import { useCallback } from 'react';
import { Trip, Spot, Expense } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/id';
import { generateDays } from '../utils/dates';

export function useTrips() {
  const [trips, setTrips] = useLocalStorage<Trip[]>('travel-app-trips', []);

  const createTrip = useCallback((name: string, startDate: string, endDate: string, defaultCurrency?: string) => {
    const trip: Trip = {
      id: generateId(),
      name,
      startDate,
      endDate,
      days: generateDays(startDate, endDate),
      expenses: [],
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

  return {
    trips, createTrip, updateTrip, deleteTrip,
    addSpot, updateSpot, removeSpot, reorderSpots, moveSpot,
    addExpense, updateExpense, removeExpense,
  };
}
