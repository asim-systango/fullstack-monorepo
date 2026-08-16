import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TicketPriority, TicketStatus } from '@shared/api-client';

export interface TicketFiltersState {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  categoryId?: string;
  assigneeId?: string;
  search?: string;
  page: number;
  limit: number;
}

const initialState: TicketFiltersState = {
  status: '',
  priority: '',
  categoryId: '',
  assigneeId: '',
  search: '',
  page: 1,
  limit: 20,
};

export const ticketFiltersSlice = createSlice({
  name: 'ticketFilters',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<TicketStatus | ''>) => {
      state.status = action.payload;
      state.page = 1;
    },
    setPriority: (state, action: PayloadAction<TicketPriority | ''>) => {
      state.priority = action.payload;
      state.page = 1;
    },
    setCategoryId: (state, action: PayloadAction<string>) => {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setAssigneeId: (state, action: PayloadAction<string>) => {
      state.assigneeId = action.payload;
      state.page = 1;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setStatus,
  setPriority,
  setCategoryId,
  setAssigneeId,
  setSearch,
  setPage,
  setLimit,
  resetFilters,
} = ticketFiltersSlice.actions;

export const ticketFiltersReducer = ticketFiltersSlice.reducer;
