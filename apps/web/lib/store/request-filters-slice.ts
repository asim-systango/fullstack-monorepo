import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LeaveStatus, TeamRequestsQuery } from '../leave/types';

// filter chrome only, the actual lists come from TanStack Query
export type MyRequestsFilter = { status: LeaveStatus | ''; page: number };

// manager approvals and admin "all requests" share this (one person is only ever one role)
export type TeamFilter = {
  status: LeaveStatus | '';
  leaveTypeId: string;
  from: string;
  to: string;
  includeDeleted: boolean;
  page: number;
};

export type RequestFiltersState = { mine: MyRequestsFilter; team: TeamFilter };

const initialTeam: TeamFilter = {
  status: 'pending',
  leaveTypeId: '',
  from: '',
  to: '',
  includeDeleted: false,
  page: 1,
};

const initialState: RequestFiltersState = {
  mine: { status: '', page: 1 },
  team: initialTeam,
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
    setTeamFilter(state, action: PayloadAction<Partial<Omit<TeamFilter, 'page'>>>) {
      Object.assign(state.team, action.payload);
      state.team.page = 1;
    },
    setTeamPage(state, action: PayloadAction<number>) {
      state.team.page = action.payload;
    },
    clearTeamFilters(state) {
      state.team = {
        ...initialTeam,
        status: '',
        includeDeleted: state.team.includeDeleted,
      };
    },
  },
});

// only send filters that are set, empty ones mean "no filter"
export function toTeamQuery(filter: TeamFilter, limit: number): TeamRequestsQuery {
  return {
    page: filter.page,
    limit,
    status: filter.status || undefined,
    leaveTypeId: filter.leaveTypeId || undefined,
    from: filter.from || undefined,
    to: filter.to || undefined,
    includeDeleted: filter.includeDeleted ? 'true' : undefined,
  };
}

export const { setMyStatus, setMyPage, setTeamFilter, setTeamPage, clearTeamFilters } =
  requestFiltersSlice.actions;
export const requestFiltersReducer = requestFiltersSlice.reducer;
