import { useState } from 'react';
import { useTripContext, useCanEdit } from '../../context/TripContext';
import { getDayColor } from '../../constants/colors';
import { Day } from '../../types';
import { ChevronDownIcon, ChevronUpIcon, EditIcon, SaveIcon, CancelIcon } from '../ui/Icons';
import LinkifiedText from '../ui/LinkifiedText';

export default function TripOverview() {
  const {
    selectedTrip, selectedDayNumber, setSelectedDayNumber,
    overviewExpanded, setOverviewExpanded, setActiveTab, updateDay,
  } = useTripContext();
  const canEdit = useCanEdit();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editJournal, setEditJournal] = useState('');

  if (!selectedTrip) return null;

  const toggleDay = (dayNumber: number) => {
    setEditing(false);
    if (overviewExpanded && selectedDayNumber === dayNumber) {
      setOverviewExpanded(false);
    } else {
      setSelectedDayNumber(dayNumber);
      setOverviewExpanded(true);
    }
  };

  const startEditing = (day: Day) => {
    setEditTitle(day.title ?? '');
    setEditJournal(day.journal ?? '');
    setEditing(true);
  };

  const handleSave = (dayNumber: number) => {
    updateDay(selectedTrip.id, dayNumber, { title: editTitle.trim(), journal: editJournal.trim() });
    setEditing(false);
  };

  return (
    <div className="pb-16">
      {selectedTrip.days.map(day => {
        const expanded = overviewExpanded && selectedDayNumber === day.dayNumber;
        const first = day.spots[0];
        const last = day.spots[day.spots.length - 1];
        const startEnd = first ? (first === last ? first.name : `${first.name} -> ${last.name}`) : '';
        const summary = day.title || startEnd;

        return (
          <div key={day.dayNumber} className={`rounded ${expanded ? 'bg-gray-50' : ''}`}>
            <button
              onClick={() => toggleDay(day.dayNumber)}
              className="w-full flex items-start gap-2 p-2 rounded hover:bg-gray-50 text-left transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: getDayColor(day.dayNumber) }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-800">
                    {day.date.slice(5).replace('-', '/')} (Day{day.dayNumber})
                  </p>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
                    {day.spots.length === 0
                      ? 'No spots'
                      : `${day.spots.length} ${day.spots.length === 1 ? 'spot' : 'spots'}`}
                    {expanded ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
                  </span>
                </div>
                {summary && (
                  <p className={`text-xs truncate ${day.title ? 'text-gray-700' : 'text-gray-500'}`}>{summary}</p>
                )}
              </div>
            </button>

            {expanded && (
              <div className="pl-7 pr-2 pb-2 space-y-2 text-xs">
                {editing ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSave(day.dayNumber);
                        if (e.key === 'Escape') setEditing(false);
                      }}
                      placeholder="Title"
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editJournal}
                      onChange={e => setEditJournal(e.target.value)}
                      onKeyDown={e => e.key === 'Escape' && setEditing(false)}
                      placeholder="Journal"
                      rows={5}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSave(day.dayNumber)}
                        className="flex items-center gap-1 bg-cyan-500 text-white px-2.5 py-1 rounded-full hover:bg-cyan-600 transition-colors"
                      >
                        <SaveIcon size={11} /> Save
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1 bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:bg-gray-300 transition-colors"
                      >
                        <CancelIcon size={11} /> Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {day.journal ? (
                      <p className="text-gray-700 whitespace-pre-wrap break-words border-t border-gray-200 pt-2">
                        <LinkifiedText text={day.journal} />
                      </p>
                    ) : canEdit && (
                      <p className="text-gray-400 border-t border-gray-200 pt-2">No journal yet.</p>
                    )}
                    <div className="flex items-center justify-between">
                      {canEdit ? (
                        <button
                          onClick={() => startEditing(day)}
                          className="flex items-center gap-1 bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-full hover:bg-cyan-100 transition-colors"
                        >
                          <EditIcon size={11} /> Edit
                        </button>
                      ) : <span />}
                      <button
                        onClick={() => setActiveTab('spots')}
                        className="bg-blue-500 text-white px-2.5 py-1 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        Go to Day {day.dayNumber}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
