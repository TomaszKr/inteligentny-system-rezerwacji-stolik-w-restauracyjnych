import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getUser, isAuthenticated, logout as doLogout, CurrentUser } from '../services/authService';

interface AuthState {
  user: CurrentUser | null;
  authed: boolean;
  isAdmin: boolean;
  refresh: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(getUser());

  const refresh = useCallback(() => setUser(getUser()), []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  // Zsynchronizuj stan między kartami (localStorage).
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const value: AuthState = {
    user,
    authed: isAuthenticated() && !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'manager',
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
