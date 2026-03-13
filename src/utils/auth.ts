const COOKIE_NAME = 'travel_app_auth';
const TOKEN_VALUE = 'authorized';

export function setAuthCookie() {
  // Cookie expires in 365 days
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${TOKEN_VALUE}; expires=${expires}; path=/; SameSite=Strict`;
}

export function removeAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
}

export function hasAuthCookie(): boolean {
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE_NAME}=${TOKEN_VALUE}`));
}

export function verifyPassword(input: string): boolean {
  return input === '19960820';
}
