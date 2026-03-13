import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { trip } = req.body;
      if (!trip) {
        return res.status(400).json({ error: 'Missing trip data' });
      }
      const id = generateId();
      await redis.set(`trip:${id}`, JSON.stringify(trip));
      return res.status(200).json({ id });
    } catch (err) {
      console.error('Failed to save trip:', err);
      return res.status(500).json({ error: 'Failed to save trip' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing id' });
      }
      const data = await redis.get(`trip:${id}`);
      if (!data) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      return res.status(200).json({ trip: typeof data === 'string' ? JSON.parse(data) : data });
    } catch (err) {
      console.error('Failed to get trip:', err);
      return res.status(500).json({ error: 'Failed to get trip' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
