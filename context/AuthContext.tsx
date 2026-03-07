import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../services/api';

export type Role = 'ADMIN' | 'CONTENT_WRITER' | 'EDITOR' | 'CHIEF_EDITOR';

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_TOKEN_KEY = 'token';
const AUTH_SESSION_HINT_KEY = 'auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getMe();
      setUser(data);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_SESSION_HINT_KEY, '1');
      }
    } catch {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasToken =
      typeof window !== 'undefined' &&
      Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY) || window.localStorage.getItem(AUTH_SESSION_HINT_KEY));
    if (!hasToken) {
      setLoading(false);
      return;
    }
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    await apiLogin(email, password);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_SESSION_HINT_KEY, '1');
    }
    await refresh();
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
    }
  };

  const value = useMemo(() => ({ user, loading, login, logout, refresh }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
