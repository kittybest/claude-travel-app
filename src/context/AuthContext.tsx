import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { hasAuthCookie, setAuthCookie, removeAuthCookie, verifyPassword } from '../utils/auth';

interface AuthContextType {
  isAuthorized: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(() => hasAuthCookie());

  const login = useCallback((password: string) => {
    if (verifyPassword(password)) {
      setAuthCookie();
      setIsAuthorized(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    removeAuthCookie();
    setIsAuthorized(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthorized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
