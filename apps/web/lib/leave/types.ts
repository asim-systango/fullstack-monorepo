export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export const LEAVE_STATUSES: readonly LeaveStatus[] = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

export type LeaveType = {
  id: string;
  name: string;
  defaultDays: number;
};

export type Balance = {
  leaveTypeId: string;
  leaveTypeName: string;
  defaultDays: number;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  configured: boolean;
};

export type Role = 'admin' | 'staff' | 'user';

export type PersonRef = { id: string; name: string; email: string; role: Role | null };

export type LeaveRequest = {
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
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

export type Quote = {
  startDate: string;
  endDate: string;
  days: number;
  holidays: Array<{ date: string; name: string }>;
};

export type MyRequestsQuery = { page: number; limit: number; status?: LeaveStatus };

export type TeamRequestsQuery = MyRequestsQuery & {
  leaveTypeId?: string;
  from?: string;
  to?: string;
  includeDeleted?: 'true';
};

export type Employee = { id: string; name: string; email: string; role: Role };

export type LeaveTypeInput = { name: string; defaultDays: number };

export type BalanceInput = {
  userId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
};

export type NewLeaveRequest = {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
};
