export type SpotCategory = 'restaurant' | 'museum' | 'natural' | 'shopping' | 'temple' | 'landmark' | 'hotel' | 'transport' | 'entertainment' | 'other';

export interface Spot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  notes?: string;
  rating?: number;
  category?: SpotCategory;
  price?: number;
  currency?: string;
  googleMapsUrl?: string;
  endDayNumber?: number;
}

export interface Day {
  dayNumber: number;
  date: string;
  spots: Spot[];
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  dayNumber?: number; // optional, for day-specific expenses
}

export interface Note {
  id: string;
  text: string;
  link?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
  expenses: Expense[];
  notes: Note[];
  defaultCurrency?: string;
}
