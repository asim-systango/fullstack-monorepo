import { BadRequestException } from '@nestjs/common';
import { LeaveRequest } from '../leave-requests/leave-request.entity';
import { BalancesService } from './balances.service';
import { LeaveBalance } from './leave-balance.entity';

const dto = { userId: 'employee-1', leaveTypeId: 'casual', year: 2026, totalDays: 4 };

function setup(options: { usedDays: number; pendingDays: number | null }) {
  const existing = Object.assign(new LeaveBalance(), {
    id: 'balance-1',
    userId: dto.userId,
    leaveTypeId: dto.leaveTypeId,
    year: dto.year,
    totalDays: 8,
    usedDays: options.usedDays,
  });
  // a fake EntityManager: findOne locks the balance, sum adds up pending days
  const manager = {
    findOne: jest.fn().mockResolvedValue(existing),
    sum: jest.fn().mockResolvedValue(options.pendingDays),
    save: jest.fn().mockResolvedValue(existing),
  };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => Promise<unknown>) =>
      work(manager),
    ),
  };
  // the summary at the end reads these, an empty one is enough here
  const builder: Record<string, jest.Mock> = {};
  for (const method of ['select', 'addSelect', 'where', 'andWhere', 'groupBy']) {
    builder[method] = jest.fn(() => builder);
  }
  builder.getRawMany = jest.fn().mockResolvedValue([]);
  const service = new BalancesService(
    { find: jest.fn().mockResolvedValue([]) } as never,
    { createQueryBuilder: jest.fn(() => builder) } as never,
    {
      getActiveOrThrow: jest.fn().mockResolvedValue({}),
      findActive: jest.fn().mockResolvedValue([]),
    } as never,
    { findApplicant: jest.fn().mockResolvedValue({ id: dto.userId }) } as never,
    dataSource as never,
  );
  return { service, manager };
}

describe('BalancesService upsert', () => {
  it('refuses a total below used + pending days', async () => {
    const { service, manager } = setup({ usedDays: 2, pendingDays: 3 });

    await expect(service.upsert({ ...dto, totalDays: 4 })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.upsert({ ...dto, totalDays: 4 })).rejects.toThrow(
      /2 used \+ 3 pending/,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('only counts pending requests of that employee, type and year', async () => {
    const { service, manager } = setup({ usedDays: 2, pendingDays: 3 });

    await service.upsert({ ...dto, totalDays: 5 });

    expect(manager.sum).toHaveBeenCalledWith(
      LeaveRequest,
      'days',
      expect.objectContaining({
        userId: dto.userId,
        leaveTypeId: dto.leaveTypeId,
        status: 'pending',
      }),
    );
    expect(manager.save).toHaveBeenCalledWith(expect.objectContaining({ totalDays: 5 }));
  });

  it('treats no pending requests as 0', async () => {
    const { service, manager } = setup({ usedDays: 2, pendingDays: null });

    await service.upsert({ ...dto, totalDays: 2 });

    expect(manager.save).toHaveBeenCalledWith(expect.objectContaining({ totalDays: 2 }));
  });
});
