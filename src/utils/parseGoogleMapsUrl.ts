/**
 * Extract lat/lng from various Google Maps URL formats:
 * - https://www.google.com/maps/place/.../@37.579,126.977,17z/...
 * - https://maps.google.com/?q=37.579,126.977
 * - https://www.google.com/maps?q=37.579,126.977
 * - https://www.google.com/maps/@37.579,126.977,17z
 * - https://maps.google.com/maps?ll=37.579,126.977
 * - https://www.google.com/maps/search/37.579,126.977
 */
export function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  try {
    // Pattern 1: /@LAT,LNG in the path
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    // Pattern 2: ?q=LAT,LNG or &q=LAT,LNG
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    // Pattern 3: ?ll=LAT,LNG
    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) {
      return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    }

    // Pattern 4: /search/LAT,LNG
    const searchMatch = url.match(/\/search\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (searchMatch) {
      return { lat: parseFloat(searchMatch[1]), lng: parseFloat(searchMatch[2]) };
    }

    // Pattern 5: !3dLAT!4dLNG (embedded/data format)
    const dataMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (dataMatch) {
      return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
    }

    return null;
  } catch {
    return null;
  }
}
