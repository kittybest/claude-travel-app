import { useState } from 'react';
import { Trip, SpotCategory } from '../../types';
import { getDayColor } from '../../constants/colors';
import { getCategoryIcon } from '../../constants/categories';
import { ExternalLinkIcon, MapPinIcon, DollarIcon } from '../ui/Icons';
import StarRating from '../spots/StarRating';

type Tab = 'spots' | 'expenses';

interface Props {
  trip: Trip;
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

export default function SharedTripView({ trip }: Props) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('spots');
  const day = trip.days.find(d => d.dayNumber === selectedDay);

  // Compute expenses from spots + manual expenses
  const spotExpenses = trip.days.flatMap(d =>
    d.spots
      .filter(s => s.price != null && s.price > 0)
      .map(s => ({
        id: `spot-${s.id}`,
        description: s.name,
        category: spotCategoryToExpenseCategory(s.category),
        amount: s.price!,
        currency: s.currency || trip.defaultCurrency || 'USD',
        dayNumber: d.dayNumber,
        isFromSpot: true,
      }))
  );
  const manualExpenses = (trip.expenses || []).map(e => ({ ...e, isFromSpot: false }));
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
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-bold text-gray-900 flex-1 truncate">{trip.name}</h2>
        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Shared</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{trip.startDate} - {trip.endDate}</p>

      <div className="flex gap-1 mb-3 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('spots')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium -mb-px ${
            activeTab === 'spots' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <MapPinIcon size={12} /> Spots
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium -mb-px ${
            activeTab === 'expenses' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <DollarIcon size={12} /> Expenses
        </button>
      </div>

      {activeTab === 'spots' ? (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1 mb-3">
            {trip.days.map(d => {
              const color = getDayColor(d.dayNumber);
              const isActive = d.dayNumber === selectedDay;
              return (
                <button
                  key={d.dayNumber}
                  onClick={() => setSelectedDay(d.dayNumber)}
                  className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                    isActive ? 'text-white shadow-sm' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={isActive ? { backgroundColor: color } : undefined}
                >
                  Day {d.dayNumber}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto">
            {day && day.spots.length > 0 ? (
              <div className="space-y-1">
                {day.spots.map((spot, idx) => (
                  <div key={spot.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: getDayColor(day.dayNumber) }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {spot.category && <span className="text-xs">{getCategoryIcon(spot.category)}</span>}
                        <p className="text-sm text-gray-800 truncate">{spot.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {spot.rating ? <StarRating value={spot.rating} size="sm" /> : null}
                        {spot.price != null && (
                          <span className="text-[10px] text-gray-500">{spot.currency} {spot.price.toFixed(2)}</span>
                        )}
                      </div>
                      {spot.notes && <p className="text-xs text-gray-400 truncate">{spot.notes}</p>}
                    </div>
                    <a
                      href={spot.googleMapsUrl || `https://www.google.com/maps?q=${spot.lat},${spot.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      title="Open in Google Maps"
                    >
                      <ExternalLinkIcon size={11} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs text-center py-4">No spots for this day.</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Expenses</h3>
            {allExpenses.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-2">No expenses yet.</p>
            ) : (
              <div className="space-y-1">
                {allExpenses.map(e => (
                  <div key={e.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 text-xs">
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
        </div>
      )}
    </div>
  );
}
