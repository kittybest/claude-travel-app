import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { CURRENCIES } from '../../constants/categories';
import { SaveIcon, CancelIcon } from '../ui/Icons';

interface Props {
  onClose: () => void;
  editTrip?: { id: string; name: string; startDate: string; endDate: string; defaultCurrency?: string };
}

export default function TripForm({ onClose, editTrip }: Props) {
  const { createTrip, updateTrip } = useTripContext();
  const [name, setName] = useState(editTrip?.name ?? '');
  const [startDate, setStartDate] = useState(editTrip?.startDate ?? '');
  const [endDate, setEndDate] = useState(editTrip?.endDate ?? '');
  const [defaultCurrency, setDefaultCurrency] = useState(editTrip?.defaultCurrency ?? 'USD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    if (editTrip) {
      updateTrip(editTrip.id, { name, startDate, endDate, defaultCurrency });
    } else {
      createTrip(name, startDate, endDate, defaultCurrency);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-80 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{editTrip ? 'Edit Trip' : 'New Trip'}</h2>
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Trip Name</span>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Seoul Trip" required
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-600">Start Date</span>
          <input
            type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-600">End Date</span>
          <input
            type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-gray-600">Default Currency</span>
          <select
            value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white rounded-full py-2 text-sm hover:bg-blue-700 transition-colors">
            <SaveIcon size={14} />
            {editTrip ? 'Save' : 'Create'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 rounded-full py-2 text-sm hover:bg-gray-200 transition-colors">
            <CancelIcon size={14} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
