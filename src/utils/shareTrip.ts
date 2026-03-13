import LZString from 'lz-string';
import { Trip } from '../types';

export function encodeTripToUrl(trip: Trip): string {
  const json = JSON.stringify(trip);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}#/share/${compressed}`;
}

export function decodeTripFromUrl(): Trip | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#/share/')) return null;
  try {
    const encoded = hash.slice('#/share/'.length);
    // Try LZ decompression first
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (decompressed) {
      return JSON.parse(decompressed) as Trip;
    }
    // Fallback: try legacy base64 decoding for old links
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as Trip;
  } catch {
    return null;
  }
}
