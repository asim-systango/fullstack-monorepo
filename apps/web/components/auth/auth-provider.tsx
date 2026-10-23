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
import {
  authApi,
  type UserProfile,
  type OrganizationContext,
  type LoginResponse,
} from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setSession, clearSession } from '@/lib/store/slices/auth.slice';

type AuthContextValue = {
  user: UserProfile | null;
  organization: OrganizationContext | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  setUserSession: (res: LoginResponse) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const dispatch = useAppDispatch();
  const { user, organization, isAuthenticated } = useAppSelector((state) => state.auth);

  // Loading state remains local since it's just for initial mount rehydration
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      const storedOrg = localStorage.getItem('organization');

      if (storedToken && storedUser) {
        dispatch(
          setSession({
            user: JSON.parse(storedUser),
            organization: storedOrg ? JSON.parse(storedOrg) : null,
            accessToken: storedToken,
          }),
        );
      }
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('organization');
      dispatch(clearSession());
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const setUserSession = useCallback(
    (res: LoginResponse) => {
      if (!res.accessToken) return;

      dispatch(
        setSession({
          user: res.user,
          organization: res.organization,
          accessToken: res.accessToken,
        }),
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        if (res.organization) {
          localStorage.setItem('organization', JSON.stringify(res.organization));
        } else {
          localStorage.removeItem('organization');
        }
        // Set session cookie for Next.js middleware checking
        document.cookie = `systango_session=${res.accessToken}; Path=/; Max-Age=604800; SameSite=Lax`;
      }
    },
    [dispatch],
  );

  const login = useCallback(
    async (email: string, password?: string) => {
      const res = await authApi.login({ email, password });
      if (res.accessToken && !res.isPasswordChangeRequired) {
        setUserSession(res);
      }
      return res;
    },
    [setUserSession],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    dispatch(clearSession());

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [dispatch]);

  const value = useMemo(
    () => ({
      user,
      organization,
      loading,
      isAuthenticated,
      login,
      logout,
      setUserSession,
    }),
    [user, organization, loading, isAuthenticated, login, logout, setUserSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
