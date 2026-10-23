import { clearDraft, leaveDraftReducer, updateDraft } from './leave-draft-slice';
import {
  clearTeamFilters,
  requestFiltersReducer,
  setMyPage,
  setMyStatus,
  setTeamFilter,
  setTeamPage,
  toTeamQuery,
} from './request-filters-slice';

describe('leaveDraft slice', () => {
  const empty = leaveDraftReducer(undefined, { type: 'init' });

  it('starts empty', () => {
    expect(empty).toEqual({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  });

  it('updates single fields', () => {
    const state = leaveDraftReducer(empty, updateDraft({ reason: 'Wedding' }));
    expect(state.reason).toBe('Wedding');
  });

  it('moves the end date when the start passes it', () => {
    const withDates = leaveDraftReducer(
      empty,
      updateDraft({ startDate: '2026-10-16', endDate: '2026-10-20' }),
    );
    const moved = leaveDraftReducer(withDates, updateDraft({ startDate: '2026-10-22' }));
    expect(moved.endDate).toBe('2026-10-22');
  });

  it('clears after submit', () => {
    const filled = leaveDraftReducer(
      empty,
      updateDraft({ reason: 'x', leaveTypeId: 'a' }),
    );
    expect(leaveDraftReducer(filled, clearDraft())).toEqual(empty);
  });
});

describe('requestFilters slice', () => {
  const start = requestFiltersReducer(undefined, { type: 'init' });

  it('resets to page 1 when the status filter changes', () => {
    const onPage3 = requestFiltersReducer(start, setMyPage(3));
    const filtered = requestFiltersReducer(onPage3, setMyStatus('pending'));
    expect(filtered.mine).toEqual({ status: 'pending', page: 1 });
  });

  it('starts the manager list on pending requests', () => {
    expect(start.team.status).toBe('pending');
  });

  it('resets the team page when a filter changes', () => {
    const onPage2 = requestFiltersReducer(start, setTeamPage(2));
    const filtered = requestFiltersReducer(
      onPage2,
      setTeamFilter({ from: '2026-10-01' }),
    );
    expect(filtered.team.page).toBe(1);
    expect(filtered.team.from).toBe('2026-10-01');
  });

  it('clears every team filter', () => {
    const filtered = requestFiltersReducer(
      start,
      setTeamFilter({ leaveTypeId: 'x', to: '2026-10-31' }),
    );
    const cleared = requestFiltersReducer(filtered, clearTeamFilters());
    expect(cleared.team).toEqual({ ...start.team, status: '' });
  });

  it('turns filters into api params, dropping empty ones', () => {
    expect(toTeamQuery(start.team, 20)).toEqual({
      page: 1,
      limit: 20,
      status: 'pending',
      leaveTypeId: undefined,
      from: undefined,
      to: undefined,
      includeDeleted: undefined,
    });
    expect(toTeamQuery({ ...start.team, includeDeleted: true }, 20).includeDeleted).toBe(
      'true',
    );
  });
});
