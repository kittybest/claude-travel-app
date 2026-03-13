import { useState, useEffect, useRef } from 'react';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function useNominatimSearch(query: string) {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': 'TravelSpotsApp/1.0' },
        }
      )
        .then(r => r.json())
        .then((data: NominatimResult[]) => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setLoading(false);
          }
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
}
