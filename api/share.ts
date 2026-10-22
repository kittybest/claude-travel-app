import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TRIPS_KEY = 'app:trips';

// Public read of a single trip by id, always serving the latest data
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing id' });
    }
    const data = await redis.get(TRIPS_KEY);
    const trips: { id: string }[] = !data ? [] : typeof data === 'string' ? JSON.parse(data) : data;
    const trip = trips.find(t => t.id === id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    return res.status(200).json({ trip });
  } catch (err) {
    console.error('Failed to get trip:', err);
    return res.status(500).json({ error: 'Failed to get trip' });
  }
}
