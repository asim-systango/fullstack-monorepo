import { decisionState, deciderRoleFor } from './decisions';

const manager = { id: 'm1', role: 'staff' as const };
const admin = { id: 'a1', role: 'admin' as const };
const employeeRow = {
  status: 'pending' as const,
  employee: { id: 'e1', role: 'user' as const },
};
const managerRow = {
  status: 'pending' as const,
  employee: { id: 'm2', role: 'staff' as const },
};

describe('decision rules (mirror of the API)', () => {
  it('picks the approver one level up', () => {
    expect(deciderRoleFor('user')).toBe('staff');
    expect(deciderRoleFor('staff')).toBe('admin');
    expect(deciderRoleFor(null)).toBe('staff');
  });

  it('lets a manager decide employee leave', () => {
    expect(decisionState(manager, employeeRow)).toEqual({ canDecide: true });
  });

  it('lets an admin decide manager leave', () => {
    expect(decisionState(admin, managerRow)).toEqual({ canDecide: true });
  });

  it('explains why the buttons are hidden', () => {
    expect(
      decisionState(manager, { ...managerRow, employee: { id: 'm1', role: 'staff' } }),
    ).toEqual({
      canDecide: false,
      reason: 'Your request',
    });
    expect(decisionState(manager, managerRow)).toEqual({
      canDecide: false,
      reason: 'Admin approves',
    });
    expect(decisionState(admin, employeeRow)).toEqual({
      canDecide: false,
      reason: 'Manager approves',
    });
  });

  it('shows nothing for decided requests', () => {
    expect(decisionState(manager, { ...employeeRow, status: 'approved' })).toEqual({
      canDecide: false,
      reason: null,
    });
  });
});
