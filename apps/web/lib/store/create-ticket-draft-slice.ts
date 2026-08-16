import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TicketPriority } from '@shared/api-client';

export type CreateTicketDraftState = {
  subject: string;
  categoryId: string;
  priority: TicketPriority;
  body: string;
};

const initialState: CreateTicketDraftState = {
  subject: '',
  categoryId: '',
  priority: 'medium',
  body: '',
};

export const createTicketDraftSlice = createSlice({
  name: 'createTicketDraft',
  initialState,
  reducers: {
    setSubject(state, action: PayloadAction<string>) {
      state.subject = action.payload;
    },
    setCategoryId(state, action: PayloadAction<string>) {
      state.categoryId = action.payload;
    },
    setPriority(state, action: PayloadAction<TicketPriority>) {
      state.priority = action.payload;
    },
    setBody(state, action: PayloadAction<string>) {
      state.body = action.payload;
    },
    resetDraft() {
      return initialState;
    },
  },
});

export const { setSubject, setCategoryId, setPriority, setBody, resetDraft } =
  createTicketDraftSlice.actions;

export const createTicketDraftReducer = createTicketDraftSlice.reducer;
