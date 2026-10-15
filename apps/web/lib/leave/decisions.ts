import type { LeaveStatus, PersonRef, Role } from './types';

// same rule as the API: managers decide employee leave, admins decide manager leave
export function deciderRoleFor(requesterRole: Role | null): Role {
  return requesterRole === 'staff' ? 'admin' : 'staff';
}

export type DecisionState =
  { canDecide: true } | { canDecide: false; reason: string | null };

// should this viewer see Approve / Reject on this row? if not, which hint to show instead
export function decisionState(
  viewer: { id: string; role: Role },
  row: { status: LeaveStatus; employee: Pick<PersonRef, 'id' | 'role'> },
): DecisionState {
  if (row.status !== 'pending') return { canDecide: false, reason: null };
  if (row.employee.id === viewer.id) return { canDecide: false, reason: 'Your request' };
  const needed = deciderRoleFor(row.employee.role);
  if (viewer.role !== needed) {
    return {
      canDecide: false,
      reason: needed === 'admin' ? 'Admin approves' : 'Manager approves',
    };
  }
  return { canDecide: true };
}
