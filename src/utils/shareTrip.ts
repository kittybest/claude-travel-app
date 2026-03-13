import LZString from 'lz-string';
import { Trip } from '../types';

export async function encodeTripToUrl(trip: Trip): Promise<string> {
  const base = `${window.location.origin}${window.location.pathname}`;
  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip }),
    });
    if (res.ok) {
      const { id } = await res.json();
      return `${base}#/s/${id}`;
    }
  } catch {
    // Fall back to LZ compression if API fails
  }
  const json = JSON.stringify(trip);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `${base}#/share/${compressed}`;
}

export async function decodeTripFromUrl(): Promise<Trip | null> {
  const hash = window.location.hash;

  // Short URL: #/s/<id>
  if (hash.startsWith('#/s/')) {
    const id = hash.slice('#/s/'.length);
    try {
      const res = await fetch(`/api/share?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const { trip } = await res.json();
        return trip as Trip;
      }
    } catch {
      // API failed
    }
    return null;
  }

  // Legacy: #/share/<encoded>
  if (hash.startsWith('#/share/')) {
    try {
      const encoded = hash.slice('#/share/'.length);
      const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
      if (decompressed) {
        return JSON.parse(decompressed) as Trip;
      }
      const json = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(json) as Trip;
    } catch {
      return null;
    }
  }

  return null;
}
