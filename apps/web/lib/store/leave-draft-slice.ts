import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// the apply form lives here so it survives leaving the page, cleared after a successful submit
export type LeaveDraft = {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

const initialState: LeaveDraft = {
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
};

const leaveDraftSlice = createSlice({
  name: 'leaveDraft',
  initialState,
  reducers: {
    updateDraft(state, action: PayloadAction<Partial<LeaveDraft>>) {
      Object.assign(state, action.payload);
      // moving the start past the end drags the end along
      if (state.startDate && state.endDate && state.endDate < state.startDate) {
        state.endDate = state.startDate;
      }
    },
    clearDraft() {
      return initialState;
    },
  },
});

export const { updateDraft, clearDraft } = leaveDraftSlice.actions;
export const leaveDraftReducer = leaveDraftSlice.reducer;
