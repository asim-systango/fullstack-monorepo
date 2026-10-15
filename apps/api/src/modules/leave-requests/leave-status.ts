export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;

export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

// these block dates for the overlap check
export const ACTIVE_STATUSES: readonly LeaveStatus[] = ['pending', 'approved'];

// only these can be soft deleted, they never touched a balance
export const REMOVABLE_STATUSES: readonly LeaveStatus[] = ['rejected', 'cancelled'];
