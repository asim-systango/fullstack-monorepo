import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, OrganizationContext } from '@/lib/api';

export interface AuthState {
  user: UserProfile | null;
  organization: OrganizationContext | null;
  accessToken: string | null;
  pendingResetToken: string | null;
  pendingUser: UserProfile | null;
  isAuthenticated: boolean;
  isPasswordChangeRequired: boolean;
}

const initialState: AuthState = {
  user: null,
  organization: null,
  accessToken: null,
  pendingResetToken: null,
  pendingUser: null,
  isAuthenticated: false,
  isPasswordChangeRequired: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        user: UserProfile;
        organization: OrganizationContext | null;
        accessToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.organization = action.payload.organization;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isPasswordChangeRequired = false;
      state.pendingResetToken = null;
      state.pendingUser = null;
    },
    setPendingPasswordReset: (
      state,
      action: PayloadAction<{
        resetToken: string;
        user: UserProfile;
      }>,
    ) => {
      state.pendingResetToken = action.payload.resetToken;
      state.pendingUser = action.payload.user;
      state.isPasswordChangeRequired = true;
      state.isAuthenticated = false;
      state.accessToken = null;
    },
    clearPendingPasswordReset: (state) => {
      state.pendingResetToken = null;
      state.pendingUser = null;
      state.isPasswordChangeRequired = false;
    },
    clearSession: (state) => {
      state.user = null;
      state.organization = null;
      state.accessToken = null;
      state.pendingResetToken = null;
      state.pendingUser = null;
      state.isAuthenticated = false;
      state.isPasswordChangeRequired = false;
    },
  },
});

export const {
  setSession,
  setPendingPasswordReset,
  clearPendingPasswordReset,
  clearSession,
} = authSlice.actions;

export default authSlice.reducer;
