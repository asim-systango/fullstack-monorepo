import { ConflictException, NotFoundException } from '@nestjs/common';
import { LeaveRequest } from '../leave-requests/leave-request.entity';
import { LeaveType } from './leave-type.entity';
import { LeaveTypesService } from './leave-types.service';

const casual = Object.assign(new LeaveType(), {
  id: 'casual',
  name: 'Casual',
  defaultDays: 12,
  deletedAt: null,
});

function setup(options: { type: LeaveType | null; pending: number }) {
  // a fake EntityManager for the archive transaction
  const manager = {
    findOne: jest.fn().mockResolvedValue(options.type),
    count: jest.fn().mockResolvedValue(options.pending),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const types = {
    manager: {
      transaction: jest.fn((work: (m: typeof manager) => Promise<unknown>) =>
        work(manager),
      ),
    },
  };
  return { service: new LeaveTypesService(types as never), manager };
}

describe('LeaveTypesService archive', () => {
  it('locks the type before counting pending requests, then archives it', async () => {
    const { service, manager } = setup({ type: casual, pending: 0 });

    await expect(service.archive('casual')).resolves.toEqual({
      id: 'casual',
      archived: true,
    });

    expect(manager.findOne).toHaveBeenCalledWith(
      LeaveType,
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
    expect(manager.count).toHaveBeenCalledWith(LeaveRequest, {
      where: { leaveTypeId: 'casual', status: 'pending' },
    });
    // the lock has to come first, or a new request could slip in after the count
    expect(manager.findOne.mock.invocationCallOrder[0]).toBeLessThan(
      manager.count.mock.invocationCallOrder[0] ?? 0,
    );
    expect(manager.update).toHaveBeenCalledWith(LeaveType, 'casual', {
      deletedAt: expect.any(Date),
    });
  });

  it('refuses while the type still has pending requests', async () => {
    const { service, manager } = setup({ type: casual, pending: 2 });

    await expect(service.archive('casual')).rejects.toThrow(ConflictException);
    await expect(service.archive('casual')).rejects.toThrow(/2 pending request/);
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('gives 404 for a type that is missing or already archived', async () => {
    const { service, manager } = setup({ type: null, pending: 0 });

    await expect(service.archive('casual')).rejects.toThrow(NotFoundException);
    expect(manager.count).not.toHaveBeenCalled();
  });
});
