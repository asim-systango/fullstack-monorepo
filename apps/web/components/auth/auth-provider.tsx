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
import type { User } from '@shared/api-client';
import { authApi } from '@/lib/api';
import {
  isMockMode,
  mockLogin,
  mockLogout,
  mockRegister,
  mockSwitchRole,
  readMockUser,
} from '@/lib/mock/auth';
import { DEMO_USER_IDS } from '@/lib/mock/data';
import { mockFoodApi } from '@/lib/mock/handlers';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: { name: string; email: string; password: string }) => Promise<User>;
  /** Mock-only: switch demo role without retyping password. */
  switchDemoRole?: (role: User['role']) => Promise<void>;
  isMock: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mock = isMockMode();

  const refresh = useCallback(async () => {
    try {
      if (mock) {
        setUser(readMockUser());
      } else {
        const me = await authApi.me();
        setUser(me);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [mock]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Keep mock food store user id in sync with logged-in demo user
  useEffect(() => {
    if (!mock) return;
    if (user?.role === 'staff') mockFoodApi.setCurrentUser(DEMO_USER_IDS.staff);
    else if (user?.role === 'admin') mockFoodApi.setCurrentUser(DEMO_USER_IDS.admin);
    else mockFoodApi.setCurrentUser(DEMO_USER_IDS.user);
  }, [mock, user]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      if (mock) {
        const next = mockLogin(input.email, input.password);
        setUser(next);
        return next;
      }
      const next = await authApi.login(input);
      setUser(next);
      return next;
    },
    [mock],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      if (mock) {
        const next = mockRegister(input);
        setUser(next);
        return next;
      }
      const next = await authApi.register(input);
      setUser(next);
      return next;
    },
    [mock],
  );

  const logout = useCallback(async () => {
    if (mock) {
      mockLogout();
      setUser(null);
      return;
    }
    await authApi.logout();
    setUser(null);
  }, [mock]);

  const switchDemoRole = useCallback(
    async (role: User['role']) => {
      if (!mock) return;
      const next = mockSwitchRole(role);
      setUser(next);
    },
    [mock],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout,
      login,
      register,
      switchDemoRole: mock ? switchDemoRole : undefined,
      isMock: mock,
    }),
    [user, loading, refresh, logout, login, register, switchDemoRole, mock],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
