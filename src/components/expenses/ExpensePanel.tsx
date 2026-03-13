import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { getCategoryIcon } from '../../constants/categories';
import { SpotCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AddIcon, DeleteIcon } from '../ui/Icons';
import ExpenseForm from './ExpenseForm';

export default function ExpensePanel() {
  const { selectedTrip, removeExpense } = useTripContext();
  const { isAuthorized } = useAuth();
  const [adding, setAdding] = useState(false);

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
  const allExpenses = [...spotExpenses, ...manualExpenses];

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
                <button
                  onClick={() => removeExpense(selectedTrip.id, e.id)}
                  className="hidden group-hover:block p-1 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <DeleteIcon size={10} />
                </button>
              )}
            </div>
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
