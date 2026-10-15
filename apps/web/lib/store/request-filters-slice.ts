import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LeaveStatus } from '../leave/types';

// filter chrome only, the actual lists come from TanStack Query
export type MyRequestsFilter = { status: LeaveStatus | ''; page: number };

export type RequestFiltersState = { mine: MyRequestsFilter };

const initialState: RequestFiltersState = {
  mine: { status: '', page: 1 },
};

const requestFiltersSlice = createSlice({
  name: 'requestFilters',
  initialState,
  reducers: {
    setMyStatus(state, action: PayloadAction<LeaveStatus | ''>) {
      state.mine.status = action.payload;
      state.mine.page = 1; // new filter, back to the first page
    },
    setMyPage(state, action: PayloadAction<number>) {
      state.mine.page = action.payload;
    },
  },
});

export const { setMyStatus, setMyPage } = requestFiltersSlice.actions;
export const requestFiltersReducer = requestFiltersSlice.reducer;
