import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../../constants/categories';
import { AddIcon, CancelIcon } from '../ui/Icons';

interface Props {
  onClose: () => void;
}

export default function ExpenseForm({ onClose }: Props) {
  const { selectedTrip, addExpense } = useTripContext();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(selectedTrip?.defaultCurrency || 'USD');
  const [dayNumber, setDayNumber] = useState<string>('');

  if (!selectedTrip) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    addExpense(selectedTrip.id, {
      description,
      category,
      amount: parseFloat(amount),
      currency,
      dayNumber: dayNumber ? parseInt(dayNumber) : undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
      <input
        type="text" value={description} onChange={e => setDescription(e.target.value)}
        placeholder="Description (e.g. Flight to Seoul)"
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <select value={category} onChange={e => setCategory(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="flex gap-2">
        <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="Amount" required
          className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={currency} onChange={e => setCurrency(e.target.value)}
          className="w-20 border border-gray-300 rounded px-1 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <select value={dayNumber} onChange={e => setDayNumber(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">No specific day</option>
        {selectedTrip.days.map(d => (
          <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber} ({d.date})</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit"
          className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white rounded-full py-1.5 text-xs hover:bg-green-600 transition-colors">
          <AddIcon size={12} /> Add Expense
        </button>
        <button type="button" onClick={onClose}
          className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-600 rounded-full py-1.5 text-xs hover:bg-gray-300 transition-colors">
          <CancelIcon size={12} /> Cancel
        </button>
      </div>
    </form>
  );
}
