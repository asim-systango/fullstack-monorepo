import type { UserRole } from '../../common/auth';
import type { Employee } from '../employees';
import type { LeaveRequest } from './leave-request.entity';
import type { LeaveStatus } from './leave-status';

export type PersonRef = {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
};

export type LeaveRequestView = {
  id: string;
  employee: PersonRef;
  leaveType: { id: string; name: string };
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  decidedBy: PersonRef | null;
  managerComment: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

function toPerson(id: string, people: Map<string, Employee>): PersonRef {
  const person = people.get(id);
  return {
    id,
    name: person?.name ?? 'Unknown user',
    email: person?.email ?? '',
    role: person?.role ?? null,
  };
}

// names come from the gateway's users table, the request only stores ids
export function toLeaveRequestView(
  request: LeaveRequest,
  people: Map<string, Employee>,
): LeaveRequestView {
  return {
    id: request.id,
    employee: toPerson(request.userId, people),
    leaveType: { id: request.leaveTypeId, name: request.leaveType?.name ?? '' },
    startDate: request.startDate,
    endDate: request.endDate,
    days: request.days,
    reason: request.reason,
    status: request.status,
    decidedBy: request.managerId ? toPerson(request.managerId, people) : null,
    managerComment: request.managerComment,
    decidedAt: request.decidedAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    deletedAt: request.deletedAt,
  };
}
