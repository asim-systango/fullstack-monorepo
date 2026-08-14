import { create } from 'zustand';
import type { User } from '@shared/types';
import { apiClient } from '@/lib/api/client';

type AuthState = {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  setUser: (user: User | null) => void;
  clearUser: () => void;
  hydrateFromMe: () => Promise<User | null>;
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
      const { data } = await apiClient.get<User>('/auth/me', {
        skipAuthRedirect: true,
      });
      get().setUser(data);
      return data;
    } catch {
      get().clearUser();
      return null;
    }
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout', undefined, {
        skipAuthRedirect: true,
      });
    } finally {
      get().clearUser();
    }
  },
}));
