import { clearDraft, leaveDraftReducer, updateDraft } from './leave-draft-slice';
import { requestFiltersReducer, setMyPage, setMyStatus } from './request-filters-slice';

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
});
