import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAuthToken, isAuthorizedRequest, authCookie, clearedAuthCookie } from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: isAuthorizedRequest(req) });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearedAuthCookie());
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const correct = process.env.APP_AUTH_CODE;
  const token = createAuthToken();
  if (!correct || !token) {
    return res.status(500).json({ error: 'Auth not configured' });
  }

  if (password === correct) {
    res.setHeader('Set-Cookie', authCookie(token));
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false });
}
