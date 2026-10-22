// The auth cookie is HttpOnly and set by the server, so the client can only ask the API about it

export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth');
    if (res.ok) {
      const data = await res.json();
      return data.ok === true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function verifyPassword(input: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: input }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.ok === true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function logoutRequest(): Promise<void> {
  try {
    await fetch('/api/auth', { method: 'DELETE' });
  } catch {
    // Ignore network errors; local state is cleared regardless
  }
}
