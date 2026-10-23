import {
  assertStatusTransition,
  isAllowedStatusTransition,
  allowedNextStatuses,
} from './issue-status';

describe('issue status transitions', () => {
  it('allows todo → in_progress only', () => {
    expect(isAllowedStatusTransition('todo', 'in_progress')).toBe(true);
    expect(isAllowedStatusTransition('todo', 'done')).toBe(false);
    expect(allowedNextStatuses('todo')).toEqual(['in_progress']);
  });

  it('allows in_progress ↔ todo and → done', () => {
    expect(isAllowedStatusTransition('in_progress', 'todo')).toBe(true);
    expect(isAllowedStatusTransition('in_progress', 'done')).toBe(true);
  });

  it('allows done → in_progress only', () => {
    expect(isAllowedStatusTransition('done', 'in_progress')).toBe(true);
    expect(isAllowedStatusTransition('done', 'todo')).toBe(false);
  });

  it('assertStatusTransition throws on illegal jump todo → done', () => {
    expect(() => assertStatusTransition('todo', 'done')).toThrow(
      /Invalid status transition/,
    );
    try {
      assertStatusTransition('todo', 'done');
    } catch (err) {
      expect(err).toMatchObject({ isStatusError: true });
    }
  });

  it('assertStatusTransition no-ops when status is unchanged', () => {
    expect(() => assertStatusTransition('todo', 'todo')).not.toThrow();
  });
});
