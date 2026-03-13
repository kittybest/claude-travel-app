import { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { BackIcon, ShareIcon, EditIcon, DeleteIcon, MapPinIcon, DollarIcon, CheckIcon } from '../ui/Icons';
import DayTabs from '../days/DayTabs';
import DaySpotList from '../days/DaySpotList';
import ExpensePanel from '../expenses/ExpensePanel';
import TripForm from './TripForm';
import { encodeTripToUrl } from '../../utils/shareTrip';

type Tab = 'spots' | 'expenses';

export default function TripDetail() {
  const { selectedTrip, setSelectedTripId, deleteTrip } = useTripContext();
  const { isAuthorized } = useAuth();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('spots');

  if (!selectedTrip) return null;

  const handleDelete = () => {
    if (confirm(`Delete "${selectedTrip.name}"?`)) {
      deleteTrip(selectedTrip.id);
      setSelectedTripId(null);
    }
  };

  const handleShare = async () => {
    const url = encodeTripToUrl(selectedTrip);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('Copy this share link:', url);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setSelectedTripId(null)}
          className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          title="Back"
        >
          <BackIcon size={14} />
        </button>
        <h2 className="text-lg font-bold text-gray-900 flex-1 truncate">{selectedTrip.name}</h2>
        <button
          onClick={handleShare}
          className={`p-1.5 rounded-full transition-colors ${
            copied ? 'bg-green-100 text-green-600' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'
          }`}
          title={copied ? 'Copied!' : 'Share'}
        >
          {copied ? <CheckIcon size={14} /> : <ShareIcon size={14} />}
        </button>
        {isAuthorized && (
          <>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-full bg-cyan-50 text-cyan-500 hover:bg-cyan-100 transition-colors"
              title="Edit Trip"
            >
              <EditIcon size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="Delete Trip"
            >
              <DeleteIcon size={14} />
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">{selectedTrip.startDate} - {selectedTrip.endDate}</p>

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
          <DayTabs />
          <div className="flex-1 overflow-y-auto mt-3">
            <DaySpotList />
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ExpensePanel />
        </div>
      )}

      {editing && (
        <TripForm
          editTrip={{
            id: selectedTrip.id,
            name: selectedTrip.name,
            startDate: selectedTrip.startDate,
            endDate: selectedTrip.endDate,
            defaultCurrency: selectedTrip.defaultCurrency,
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
