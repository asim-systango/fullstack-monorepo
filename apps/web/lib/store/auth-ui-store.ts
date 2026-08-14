import { create } from 'zustand';

type AuthUiState = {
  /** Cross-route email for register → OTP / forgot → reset flows. */
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
  reset: () => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  pendingEmail: null,
  setPendingEmail: (email) => set({ pendingEmail: email }),
  reset: () => set({ pendingEmail: null }),
}));
