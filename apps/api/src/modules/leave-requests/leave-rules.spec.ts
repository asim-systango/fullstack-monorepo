import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  assertCanDecide,
  assertDateRange,
  assertFilterRange,
  assertPending,
  availableDays,
  deciderRoleFor,
  fieldError,
} from './leave-rules';

describe('leave rules', () => {
  describe('fieldError', () => {
    it('builds a 400 with details for the form', () => {
      const err = fieldError('endDate', 'Bad date');
      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toMatchObject({
        details: [{ field: 'endDate', message: 'Bad date' }],
      });
    });
  });

  describe('assertDateRange', () => {
    it('accepts a normal range and a single day', () => {
      expect(() => assertDateRange('2026-10-16', '2026-10-20')).not.toThrow();
      expect(() => assertDateRange('2026-10-16', '2026-10-16')).not.toThrow();
    });

    it('rejects end before start', () => {
      expect(() => assertDateRange('2026-10-20', '2026-10-16')).toThrow(
        BadRequestException,
      );
    });

    it('rejects a range that crosses into next year', () => {
      expect(() => assertDateRange('2026-12-30', '2027-01-02')).toThrow(/next year/);
    });
  });

  describe('assertFilterRange', () => {
    it('allows missing or ordered dates', () => {
      expect(() => assertFilterRange()).not.toThrow();
      expect(() => assertFilterRange('2026-10-01')).not.toThrow();
      expect(() => assertFilterRange('2026-10-01', '2026-10-31')).not.toThrow();
    });

    it('rejects from after to', () => {
      expect(() => assertFilterRange('2026-10-31', '2026-10-01')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('approval chain', () => {
    const employeeId = 'employee-1';
    const manager = { id: 'manager-1', role: 'staff' as const };
    const admin = { id: 'admin-1', role: 'admin' as const };

    it('sends employee leave to a manager and manager leave to an admin', () => {
      expect(deciderRoleFor('user')).toBe('staff');
      expect(deciderRoleFor('staff')).toBe('admin');
      expect(deciderRoleFor(undefined)).toBe('staff');
    });

    it('lets a manager decide an employee request', () => {
      expect(() => assertCanDecide(manager, employeeId, 'user')).not.toThrow();
    });

    it('lets an admin decide a manager request', () => {
      expect(() => assertCanDecide(admin, manager.id, 'staff')).not.toThrow();
    });

    it('blocks deciding your own request', () => {
      expect(() => assertCanDecide(manager, manager.id, 'staff')).toThrow(
        /your own request/,
      );
    });

    it('blocks the wrong level', () => {
      expect(() => assertCanDecide(admin, employeeId, 'user')).toThrow(
        ForbiddenException,
      );
      expect(() =>
        assertCanDecide({ id: 'manager-2', role: 'staff' }, manager.id, 'staff'),
      ).toThrow(/by an admin/);
    });
  });

  describe('assertPending', () => {
    it('only lets pending requests move', () => {
      expect(() => assertPending('pending', 'approved')).not.toThrow();
      expect(() => assertPending('approved', 'approved')).toThrow(
        'Only pending requests can be approved, this one is already approved',
      );
      expect(() => assertPending('cancelled', 'rejected')).toThrow(BadRequestException);
    });
  });

  it('calculates days left as total - used - pending', () => {
    expect(availableDays({ totalDays: 12, usedDays: 3 }, 2)).toBe(7);
  });
});
