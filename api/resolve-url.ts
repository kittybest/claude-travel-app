import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    return res.status(200).json({ resolvedUrl: response.url });
  } catch (err) {
    console.error('Failed to resolve URL:', err);
    return res.status(500).json({ error: 'Failed to resolve URL' });
  }
}
