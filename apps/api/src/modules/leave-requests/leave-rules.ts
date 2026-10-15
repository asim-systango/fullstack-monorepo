import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { UserRole } from '../../common/auth';
import { yearOf } from '../../common/dates';
import type { LeaveStatus } from './leave-status';

// 400 with "details" so the form can show the message under the right field
export function fieldError(field: string, message: string) {
  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message,
    details: [{ field, message }],
  });
}

export function assertDateRange(startDate: string, endDate: string) {
  if (endDate < startDate) {
    throw fieldError('endDate', 'End date must be on or after the start date');
  }
  if (yearOf(startDate) !== yearOf(endDate)) {
    throw fieldError(
      'endDate',
      "A request can't cross into the next year, split it into two",
    );
  }
}

export function assertFilterRange(from?: string, to?: string) {
  if (from && to && from > to) {
    throw fieldError('to', '"to" must be on or after "from"');
  }
}

// one level up: managers decide employee leave, admins decide manager leave
export function deciderRoleFor(requesterRole: UserRole | undefined): UserRole {
  return requesterRole === 'staff' ? 'admin' : 'staff';
}

export function assertCanDecide(
  actor: { id: string; role: UserRole },
  requesterId: string,
  requesterRole: UserRole | undefined,
) {
  if (actor.id === requesterId) {
    throw new ForbiddenException("You can't approve or reject your own request");
  }
  const needed = deciderRoleFor(requesterRole);
  if (actor.role !== needed) {
    throw new ForbiddenException(
      needed === 'admin'
        ? "A manager's leave is approved or rejected by an admin"
        : 'Employee leave is approved or rejected by a manager',
    );
  }
}

// pending is the only status that can move
export function assertPending(
  status: LeaveStatus,
  next: Exclude<LeaveStatus, 'pending'>,
) {
  if (status !== 'pending') {
    throw new BadRequestException(
      `Only pending requests can be ${next}, this one is already ${status}`,
    );
  }
}

export function availableDays(
  balance: { totalDays: number; usedDays: number },
  pendingDays: number,
) {
  return balance.totalDays - balance.usedDays - pendingDays;
}
