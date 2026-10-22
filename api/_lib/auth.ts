import type { VercelRequest } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';

export const AUTH_COOKIE_NAME = 'travel_app_auth';
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

// Stateless token: derived from the auth code, so changing the code invalidates every session
export function createAuthToken(): string | null {
  const secret = process.env.APP_AUTH_CODE;
  if (!secret) return null;
  return createHmac('sha256', secret).update('travel-app-auth').digest('hex');
}

export function isAuthorizedRequest(req: VercelRequest): boolean {
  const expected = createAuthToken();
  const actual = req.cookies?.[AUTH_COOKIE_NAME];
  if (!expected || !actual) return false;
  const a = new TextEncoder().encode(actual);
  const b = new TextEncoder().encode(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function authCookie(token: string): string {
  return `${AUTH_COOKIE_NAME}=${token}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export function clearedAuthCookie(): string {
  return `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`;
}
