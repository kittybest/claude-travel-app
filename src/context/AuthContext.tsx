import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { checkAuth, verifyPassword, logoutRequest } from '../utils/auth';

interface AuthContextType {
  isAuthorized: boolean;
  authChecked: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth().then(ok => {
      setIsAuthorized(ok);
      setAuthChecked(true);
    });
  }, []);

  const login = useCallback(async (password: string) => {
    const ok = await verifyPassword(password);
    if (ok) {
      setIsAuthorized(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setIsAuthorized(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthorized, authChecked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
