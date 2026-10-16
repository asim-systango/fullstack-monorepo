'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/api-client';
import { toUserMessage } from '@/lib/auth/errors';
import { useAuthMeQuery, useLogout } from '@/lib/auth/hooks';
import { queryKeys } from '@/lib/query-keys';

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setSessionUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();
  const meQuery = useAuthMeQuery();
  const logoutMutation = useLogout();

  const user = meQuery.data ?? null;
  const initialLoading =
    meQuery.isPending || (meQuery.isFetching && meQuery.data === undefined);
  const error = meQuery.isError ? toUserMessage(meQuery.error) : null;

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  }, [queryClient]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const setSessionUser = useCallback(
    (next: User | null) => {
      queryClient.setQueryData(queryKeys.auth.me, next);
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: initialLoading,
      error,
      refresh,
      logout,
      setSessionUser,
    }),
    [user, initialLoading, error, refresh, logout, setSessionUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
