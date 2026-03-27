import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const TRIPS_KEY = 'app:trips';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const data = await redis.get(TRIPS_KEY);
      if (!data) {
        return res.status(200).json({ trips: [] });
      }
      const trips = typeof data === 'string' ? JSON.parse(data) : data;
      return res.status(200).json({ trips });
    } catch (err) {
      console.error('Failed to get trips:', err);
      return res.status(500).json({ error: 'Failed to get trips' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { trips } = req.body;
      if (!Array.isArray(trips)) {
        return res.status(400).json({ error: 'trips must be an array' });
      }
      await redis.set(TRIPS_KEY, JSON.stringify(trips));
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Failed to save trips:', err);
      return res.status(500).json({ error: 'Failed to save trips' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
