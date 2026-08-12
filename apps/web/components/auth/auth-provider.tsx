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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<OrganizationContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      const storedOrg = localStorage.getItem('organization');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        if (storedOrg) {
          setOrganization(JSON.parse(storedOrg));
        }
      }
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('organization');
    } finally {
      setLoading(false);
    }
  }, []);

  const setUserSession = useCallback((res: LoginResponse) => {
    if (!res.accessToken) return;

    setUser(res.user);
    setOrganization(res.organization);

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
  }, []);

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
    setUser(null);
    setOrganization(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      organization,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      setUserSession,
    }),
    [user, organization, loading, login, logout, setUserSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
