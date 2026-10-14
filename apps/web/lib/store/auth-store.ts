import { create } from 'zustand';
import { fetchMe, logout as logoutRequest } from '@/lib/api/auth-api';
import type { MeUser } from '@/lib/auth/session';

type AuthState = {
  user: MeUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  setUser: (user: MeUser | null) => void;
  clearUser: () => void;
  hydrateFromMe: () => Promise<MeUser | null>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  setUser(user) {
    set({
      user,
      status: user ? 'authenticated' : 'anonymous',
    });
  },

  clearUser() {
    set({ user: null, status: 'anonymous' });
  },

  async hydrateFromMe() {
    set({ status: 'loading' });
    try {
      const user = await fetchMe();
      get().setUser(user);
      return user;
    } catch {
      get().clearUser();
      return null;
    }
  },

  async logout() {
    try {
      await logoutRequest();
    } finally {
      get().clearUser();
    }
  },
}));
