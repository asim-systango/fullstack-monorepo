import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUiState = {
  pendingEmail: string | null;
};

const initialState: AuthUiState = {
  pendingEmail: null,
};

const authUiSlice = createSlice({
  name: 'authUi',
  initialState,
  reducers: {
    setPendingEmail(state, action: PayloadAction<string | null>) {
      state.pendingEmail = action.payload;
    },
    resetAuthUi() {
      return initialState;
    },
  },
});

export const { setPendingEmail, resetAuthUi } = authUiSlice.actions;
export const authUiReducer = authUiSlice.reducer;
