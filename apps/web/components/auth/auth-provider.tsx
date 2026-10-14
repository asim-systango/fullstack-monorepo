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
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/api-client';
import { authApi } from '@/lib/api';
import { clearUserFoodCache } from '@/lib/food-cache';
import {
  clearOrderStatusFilter,
  clearRestaurantFilters,
  store,
} from '@/lib/store';
import {
  isMockMode,
  mockLogin,
  mockLogout,
  mockRegister,
  mockSaveAddress,
  mockSwitchRole,
  readMockUser,
} from '@/lib/mock/auth';
import { mockFoodApi } from '@/lib/mock/handlers';

export type AuthPendingAction = 'login' | 'logout' | 'register';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  pendingAction: AuthPendingAction | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: { name: string; email: string; password: string }) => Promise<User>;
  saveAddress: (input: { deliveryAddress: string }) => Promise<User>;
  switchDemoRole?: (role: User['role']) => Promise<void>;
  isMock: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resetWorkspaceUiState() {
  store.dispatch(clearRestaurantFilters());
  store.dispatch(clearOrderStatusFilter());
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<AuthPendingAction | null>(null);
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

  useEffect(() => {
    if (!mock || !user) return;
    mockFoodApi.setCurrentUser(user.id);
  }, [mock, user]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      setPendingAction('login');
      try {
        clearUserFoodCache(queryClient);
        resetWorkspaceUiState();

        if (mock) {
          const next = mockLogin(input.email, input.password);
          mockFoodApi.setCurrentUser(next.id);
          setUser(next);
          return next;
        }
        const next = await authApi.login(input);
        setUser(next);
        return next;
      } finally {
        setPendingAction(null);
      }
    },
    [mock, queryClient],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      setPendingAction('register');
      try {
        clearUserFoodCache(queryClient);
        resetWorkspaceUiState();

        if (mock) {
          const next = mockRegister(input);
          mockFoodApi.setCurrentUser(next.id);
          setUser(next);
          return next;
        }
        const next = await authApi.register(input);
        setUser(next);
        return next;
      } finally {
        setPendingAction(null);
      }
    },
    [mock, queryClient],
  );

  const logout = useCallback(async () => {
    setPendingAction('logout');
    try {
      clearUserFoodCache(queryClient);
      resetWorkspaceUiState();

      if (mock) {
        mockLogout();
        setUser(null);
        return;
      }
      await authApi.logout();
      setUser(null);
    } finally {
      setPendingAction(null);
    }
  }, [mock, queryClient]);

  const saveAddress = useCallback(
    async (input: { deliveryAddress: string }) => {
      if (mock) {
        const next = mockSaveAddress(input.deliveryAddress);
        setUser(next);
        return next;
      }
      const next = await authApi.saveAddress(input);
      setUser(next);
      return next;
    },
    [mock],
  );

  const switchDemoRole = useCallback(
    async (role: User['role']) => {
      if (!mock) return;
      clearUserFoodCache(queryClient);
      resetWorkspaceUiState();
      const next = mockSwitchRole(role);
      mockFoodApi.setCurrentUser(next.id);
      setUser(next);
    },
    [mock, queryClient],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      pendingAction,
      refresh,
      logout,
      login,
      register,
      saveAddress,
      switchDemoRole: mock ? switchDemoRole : undefined,
      isMock: mock,
    }),
    [
      user,
      loading,
      pendingAction,
      refresh,
      logout,
      login,
      register,
      saveAddress,
      switchDemoRole,
      mock,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
