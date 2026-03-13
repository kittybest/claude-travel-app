import { useState } from 'react';
import { useNominatimSearch, NominatimResult } from '../../hooks/useNominatimSearch';

interface Props {
  onSelect: (result: { name: string; lat: number; lng: number }) => void;
}

export default function PlaceSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const { results, loading } = useNominatimSearch(query);
  const [showResults, setShowResults] = useState(true);

  const handleSelect = (r: NominatimResult) => {
    const shortName = r.display_name.split(',')[0];
    onSelect({ name: shortName, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setQuery(shortName);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setShowResults(true); }}
        placeholder="Search a place..."
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loading && <span className="absolute right-2 top-2 text-xs text-gray-400">...</span>}
      {showResults && results.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded mt-1 shadow-lg max-h-40 overflow-y-auto">
          {results.map(r => (
            <li
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="px-2 py-1.5 text-xs hover:bg-blue-50 cursor-pointer truncate border-b border-gray-100 last:border-0"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
