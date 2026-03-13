import { SpotCategory } from '../types';

export const SPOT_CATEGORIES: { value: SpotCategory; label: string; icon: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽' },
  { value: 'museum', label: 'Museum', icon: '🏛' },
  { value: 'natural', label: 'Nature', icon: '🌿' },
  { value: 'shopping', label: 'Shopping', icon: '🛍' },
  { value: 'temple', label: 'Temple', icon: '⛩' },
  { value: 'landmark', label: 'Landmark', icon: '🏰' },
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'transport', label: 'Transport', icon: '🚆' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
  { value: 'other', label: 'Other', icon: '📍' },
];

export const EXPENSE_CATEGORIES = [
  'Flight',
  'Hotel',
  'Transport',
  'Food & Drink',
  'Shopping',
  'Attraction',
  'Entertainment',
  'Convenience',
  'Insurance',
  'Other',
];

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CNY', 'TWD', 'HKD',
  'THB', 'SGD', 'AUD', 'CAD', 'CHF', 'AED', 'MYR', 'VND',
  'IDR', 'PHP', 'INR', 'NZD', 'SEK', 'NOK', 'DKK', 'TRY',
];

export function getCategoryIcon(category: SpotCategory | undefined): string {
  return SPOT_CATEGORIES.find(c => c.value === category)?.icon ?? '📍';
}
