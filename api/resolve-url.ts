import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Try to extract coordinates from a URL string using common map URL patterns.
 */
function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // /@LAT,LNG
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

  // ?q=LAT,LNG
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

  // !3dLAT!4dLNG
  const dataMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (dataMatch) return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };

  return null;
}

/**
 * Try to extract coordinates from HTML body (Google Maps embeds coords in page data).
 * Looks for patterns like: LAT%2CLNG (URL-encoded comma) or [null,null,LAT,LNG]
 */
function extractCoordsFromHtml(html: string): { lat: number; lng: number } | null {
  // Pattern: LAT%2CLNG (URL-encoded comma in embedded URLs)
  // Lat range: -90 to 90, Lng range: -180 to 180
  const encodedMatch = html.match(/(-?\d{1,2}\.\d{5,})%2C(-?\d{1,3}\.\d{5,})/);
  if (encodedMatch) {
    const lat = parseFloat(encodedMatch[1]);
    const lng = parseFloat(encodedMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern: center=LAT,LNG or ll=LAT,LNG in the HTML
  const centerMatch = html.match(/(?:center|ll)=(-?\d{1,2}\.\d{5,}),(-?\d{1,3}\.\d{5,})/);
  if (centerMatch) {
    return { lat: parseFloat(centerMatch[1]), lng: parseFloat(centerMatch[2]) };
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url parameter required' });
  }

  try {
    const response = await fetch(url, { redirect: 'follow' });
    const finalUrl = response.url;

    // First, try extracting from the resolved URL itself
    const urlCoords = extractCoordsFromUrl(finalUrl);
    if (urlCoords) {
      return res.status(200).json({ resolvedUrl: finalUrl, coords: urlCoords });
    }

    // If URL doesn't have coords, try parsing the HTML body
    const html = await response.text();
    const htmlCoords = extractCoordsFromHtml(html);
    if (htmlCoords) {
      return res.status(200).json({ resolvedUrl: finalUrl, coords: htmlCoords });
    }

    return res.status(200).json({ resolvedUrl: finalUrl, coords: null });
  } catch (err) {
    console.error('Failed to resolve URL:', err);
    return res.status(500).json({ error: 'Failed to resolve URL' });
  }
}
