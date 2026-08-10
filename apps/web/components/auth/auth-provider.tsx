'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchProfileApi, logoutApi } from '@/features/auth/services';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import type { AuthUser } from '@/features/auth/types';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await fetchProfileApi();
      if (me) {
        const token =
          useAuthStore.getState().accessToken ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('access_token') || ''
            : '');
        setAuth({ accessToken: token, user: me });
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [setAuth, clearAuth]);

  useEffect(() => {
    if (
      isAuthenticated ||
      (typeof window !== 'undefined' && localStorage.getItem('access_token'))
    ) {
      void refresh();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, refresh]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
