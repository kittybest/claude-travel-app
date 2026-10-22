import { Trip } from '../types';

const SHARE_PREFIX = '#/s/';

// Share links point at the trip id, so viewers always see the latest data
export function getShareUrl(trip: Trip): string {
  return `${window.location.origin}${window.location.pathname}${SHARE_PREFIX}${trip.id}`;
}

export function getShareIdFromHash(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith(SHARE_PREFIX)) return null;
  return hash.slice(SHARE_PREFIX.length) || null;
}

export async function fetchSharedTrip(id: string): Promise<Trip | null> {
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
