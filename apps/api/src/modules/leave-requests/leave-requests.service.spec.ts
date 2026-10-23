import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { JwtUser } from '../../common/auth';
import { LeaveBalance } from '../balances/leave-balance.entity';
import { LeaveRequest } from './leave-request.entity';
import { LeaveRequestsService } from './leave-requests.service';

const employee: JwtUser = { id: 'employee-1', email: 'user@demo.local', role: 'user' };
const manager: JwtUser = { id: 'manager-1', email: 'staff@demo.local', role: 'staff' };
const admin: JwtUser = { id: 'admin-1', email: 'admin@demo.local', role: 'admin' };

function makeRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return Object.assign(new LeaveRequest(), {
    id: 'request-1',
    userId: employee.id,
    leaveTypeId: 'casual',
    startDate: '2026-10-26',
    endDate: '2026-10-27',
    days: 2,
    reason: 'Wedding',
    status: 'pending',
    managerId: null,
    managerComment: null,
    decidedAt: null,
    deletedAt: null,
    ...overrides,
  });
}

function setup(options: {
  request: LeaveRequest;
  requesterRole: string;
  balance?: Partial<LeaveBalance>;
  holidays?: string[];
}) {
  // a fake EntityManager: the first findOne locks the request, the second locks the balance
  const manager = {
    findOne: jest.fn((entity: unknown) =>
      Promise.resolve(
        entity === LeaveRequest ? options.request : (options.balance ?? null),
      ),
    ),
    update: jest.fn().mockResolvedValue(undefined),
    increment: jest.fn().mockResolvedValue(undefined),
  };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => Promise<unknown>) =>
      work(manager),
    ),
  };
  const requests = { findOne: jest.fn().mockResolvedValue(options.request) };
  const employees = {
    findById: jest
      .fn()
      .mockResolvedValue({ id: options.request.userId, role: options.requesterRole }),
    byIds: jest.fn().mockResolvedValue(new Map()),
  };
  const holidays = {
    datesBetween: jest.fn().mockResolvedValue(new Set(options.holidays ?? [])),
  };
  const service = new LeaveRequestsService(
    requests as never,
    dataSource as never,
    {} as never,
    holidays as never,
    employees as never,
  );
  return { service, manager, dataSource };
}

describe('LeaveRequestsService approve / reject', () => {
  it('approves in one transaction: balance goes up and status changes', async () => {
    const {
      service,
      manager: m,
      dataSource,
    } = setup({
      request: makeRequest(),
      requesterRole: 'user',
      balance: { id: 'balance-1', totalDays: 12, usedDays: 3, year: 2026 },
    });

    await service.approve(manager, 'request-1', { comment: 'Enjoy' });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(m.increment).toHaveBeenCalledWith(
      LeaveBalance,
      { id: 'balance-1' },
      'usedDays',
      2,
    );
    expect(m.update).toHaveBeenCalledWith(
      LeaveRequest,
      'request-1',
      expect.objectContaining({
        status: 'approved',
        managerId: manager.id,
        managerComment: 'Enjoy',
      }),
    );
  });

  it("refuses a manager's own request", async () => {
    const { service, manager: m } = setup({
      request: makeRequest({ userId: manager.id }),
      requesterRole: 'staff',
    });

    await expect(service.approve(manager, 'request-1', {})).rejects.toThrow(
      ForbiddenException,
    );
    expect(m.update).not.toHaveBeenCalled();
  });

  it('only lets an admin decide a manager request', async () => {
    const managerRequest = makeRequest({ userId: 'manager-2' });
    const { service } = setup({
      request: managerRequest,
      requesterRole: 'staff',
      balance: { id: 'balance-2', totalDays: 12, usedDays: 0, year: 2026 },
    });

    await expect(service.approve(manager, 'request-1', {})).rejects.toThrow(
      /by an admin/,
    );
    await expect(service.approve(admin, 'request-1', {})).resolves.toBeDefined();
  });

  it('refuses to approve a request that is not pending', async () => {
    const { service, manager: m } = setup({
      request: makeRequest({ status: 'approved' }),
      requesterRole: 'user',
    });

    await expect(service.approve(manager, 'request-1', {})).rejects.toThrow(
      BadRequestException,
    );
    expect(m.increment).not.toHaveBeenCalled();
  });

  it('stops before writing anything when the balance is too small', async () => {
    const { service, manager: m } = setup({
      // Mon 26 → Fri 30 Oct = 5 working days
      request: makeRequest({ endDate: '2026-10-30', days: 5 }),
      requesterRole: 'user',
      balance: { id: 'balance-1', totalDays: 12, usedDays: 10, year: 2026 },
    });

    await expect(service.approve(manager, 'request-1', {})).rejects.toThrow(
      /Not enough days/,
    );
    expect(m.increment).not.toHaveBeenCalled();
    expect(m.update).not.toHaveBeenCalled();
  });

  it('recounts a pending request when a holiday was added after applying', async () => {
    const { service, manager: m } = setup({
      // Mon 21 → Thu 24 Dec was 4 days, then 23 Dec became a holiday
      request: makeRequest({ startDate: '2026-12-21', endDate: '2026-12-24', days: 4 }),
      requesterRole: 'user',
      balance: { id: 'balance-1', totalDays: 12, usedDays: 3, year: 2026 },
      holidays: ['2026-12-23'],
    });

    await service.approve(manager, 'request-1', {});

    expect(m.update).toHaveBeenCalledWith(LeaveRequest, 'request-1', { days: 3 });
    expect(m.increment).toHaveBeenCalledWith(
      LeaveBalance,
      { id: 'balance-1' },
      'usedDays',
      3,
    );
  });

  it('refuses to approve when holidays now cover every day of the request', async () => {
    const { service, manager: m } = setup({
      request: makeRequest(),
      requesterRole: 'user',
      balance: { id: 'balance-1', totalDays: 12, usedDays: 3, year: 2026 },
      holidays: ['2026-10-26', '2026-10-27'],
    });

    await expect(service.approve(manager, 'request-1', {})).rejects.toThrow(
      /No working days left/,
    );
    expect(m.increment).not.toHaveBeenCalled();
  });

  it('rejects without touching the balance', async () => {
    const { service, manager: m } = setup({
      request: makeRequest(),
      requesterRole: 'user',
    });

    await service.reject(manager, 'request-1', { comment: 'Release week' });

    expect(m.increment).not.toHaveBeenCalled();
    expect(m.update).toHaveBeenCalledWith(
      LeaveRequest,
      'request-1',
      expect.objectContaining({ status: 'rejected', managerComment: 'Release week' }),
    );
  });
});
