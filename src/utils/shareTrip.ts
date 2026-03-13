import { Trip } from '../types';

export function encodeTripToUrl(trip: Trip): string {
  const json = JSON.stringify(trip);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}${window.location.pathname}#/share/${encoded}`;
}

export function decodeTripFromUrl(): Trip | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#/share/')) return null;
  try {
    const encoded = hash.slice('#/share/'.length);
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as Trip;
  } catch {
    return null;
  }
}
