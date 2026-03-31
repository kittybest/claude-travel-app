import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { SpotCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AddIcon, DeleteIcon, EditIcon, SaveIcon, CancelIcon } from '../ui/Icons';
import { EXPENSE_CATEGORIES, CURRENCIES } from '../../constants/categories';
import ExpenseForm from './ExpenseForm';

export default function ExpensePanel() {
  const { selectedTrip, removeExpense, updateExpense } = useTripContext();
  const { isAuthorized } = useAuth();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCurrency, setEditCurrency] = useState('');
  const [editDayNumber, setEditDayNumber] = useState<string>('');

  const startEditing = (e: { id: string; description: string; category: string; amount: number; currency: string; dayNumber?: number }) => {
    setEditingId(e.id);
    setEditDesc(e.description);
    setEditCategory(e.category);
    setEditAmount(e.amount.toString());
    setEditCurrency(e.currency);
    setEditDayNumber(e.dayNumber?.toString() ?? '');
  };

  const handleSaveEdit = () => {
    if (!selectedTrip || !editingId || !editDesc || !editAmount) return;
    updateExpense(selectedTrip.id, editingId, {
      description: editDesc,
      category: editCategory,
      amount: parseFloat(editAmount),
      currency: editCurrency,
      dayNumber: editDayNumber ? parseInt(editDayNumber) : undefined,
    });
    setEditingId(null);
  };

  if (!selectedTrip) return null;

  const spotExpenses = selectedTrip.days.flatMap(day =>
    day.spots
      .filter(s => s.price != null && s.price > 0)
      .map(s => ({
        id: `spot-${s.id}`,
        description: s.name,
        category: spotCategoryToExpenseCategory(s.category),
        amount: s.price!,
        currency: s.currency || selectedTrip.defaultCurrency || 'USD',
        dayNumber: day.dayNumber,
        isFromSpot: true,
      }))
  );

  const manualExpenses = (selectedTrip.expenses || []).map(e => ({ ...e, isFromSpot: false }));
  const allExpenses = [...spotExpenses, ...manualExpenses].sort((a, b) => {
    const da = a.dayNumber ?? 0;
    const db = b.dayNumber ?? 0;
    return da - db;
  });

  const summary: Record<string, Record<string, number>> = {};
  for (const e of allExpenses) {
    if (!summary[e.category]) summary[e.category] = {};
    summary[e.category][e.currency] = (summary[e.category][e.currency] || 0) + e.amount;
  }

  const totals: Record<string, number> = {};
  for (const e of allExpenses) {
    totals[e.currency] = (totals[e.currency] || 0) + e.amount;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Expenses</h3>
        {isAuthorized && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full hover:bg-green-600 transition-colors"
            title="Add Expense"
          >
            <AddIcon size={11} />
            <span>Add Expense</span>
          </button>
        )}
      </div>

      {adding && <ExpenseForm onClose={() => setAdding(false)} />}

      {allExpenses.length === 0 && !adding ? (
        <p className="text-gray-400 text-xs text-center py-2">No expenses yet.</p>
      ) : (
        <div className="space-y-1">
          {allExpenses.map(e => (
            editingId === e.id ? (
              <div key={e.id} className="p-2 border border-gray-200 rounded text-xs space-y-2">
                <input value={editDesc} onChange={ev => setEditDesc(ev.target.value)} placeholder="Description"
                  className="w-full border border-gray-300 rounded px-2 py-1" />
                <select value={editCategory} onChange={ev => setEditCategory(ev.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 bg-white">
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-1">
                  <input type="number" step="0.01" min="0" value={editAmount} onChange={ev => setEditAmount(ev.target.value)}
                    placeholder="Amount" className="flex-1 border border-gray-300 rounded px-2 py-1" />
                  <select value={editCurrency} onChange={ev => setEditCurrency(ev.target.value)}
                    className="w-16 border border-gray-300 rounded px-1 py-1 bg-white">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <select value={editDayNumber} onChange={ev => setEditDayNumber(ev.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 bg-white">
                  <option value="">No specific day</option>
                  {selectedTrip.days.map(d => (
                    <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber} ({d.date})</option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <button onClick={handleSaveEdit}
                    className="flex items-center gap-1 bg-cyan-500 text-white px-2.5 py-1 rounded-full hover:bg-cyan-600 transition-colors">
                    <SaveIcon size={11} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-300 transition-colors">
                    <CancelIcon size={11} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={e.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 group text-xs">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.isFromSpot ? 'bg-green-400' : 'bg-orange-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate">{e.description}</p>
                  <p className="text-[10px] text-gray-400">
                    {e.category}
                    {e.dayNumber ? ` · Day ${e.dayNumber}` : ''}
                    {e.isFromSpot ? ' · from spot' : ''}
                  </p>
                </div>
                <span className="text-gray-600 font-medium whitespace-nowrap">{e.currency} {e.amount.toFixed(2)}</span>
                {isAuthorized && !e.isFromSpot && (
                  <div className="hidden group-hover:flex gap-1">
                    <button
                      onClick={() => startEditing(e)}
                      className="p-1 rounded-full bg-cyan-50 text-cyan-500 hover:bg-cyan-100 transition-colors"
                      title="Edit"
                    >
                      <EditIcon size={10} />
                    </button>
                    <button
                      onClick={() => removeExpense(selectedTrip.id, e.id)}
                      className="p-1 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <DeleteIcon size={10} />
                    </button>
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {Object.keys(summary).length > 0 && (
        <div className="border-t border-gray-200 pt-2 space-y-1">
          <p className="text-xs font-medium text-gray-600">By Category</p>
          {Object.entries(summary).map(([cat, currencies]) => (
            <div key={cat} className="flex items-center justify-between text-xs px-2">
              <span className="text-gray-500">{cat}</span>
              <span className="text-gray-700">
                {Object.entries(currencies).map(([cur, amt]) => `${cur} ${amt.toFixed(2)}`).join(' + ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {Object.keys(totals).length > 0 && (
        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-semibold text-gray-900">
              {Object.entries(totals).map(([cur, amt]) => `${cur} ${amt.toFixed(2)}`).join(' + ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function spotCategoryToExpenseCategory(cat?: SpotCategory): string {
  switch (cat) {
    case 'restaurant': return 'Food & Drink';
    case 'museum': case 'temple': case 'landmark': case 'entertainment': return 'Attraction';
    case 'shopping': return 'Shopping';
    case 'hotel': return 'Hotel';
    case 'transport': return 'Transport';
    default: return 'Other';
  }
}
