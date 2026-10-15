import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { rethrowDbError } from '../../common/database';
import { todayUtc, yearOf } from '../../common/dates';
import { EmployeesService } from '../employees';
import { LeaveRequest } from '../leave-requests/leave-request.entity';
import { LeaveTypesService } from '../leave-types/leave-types.service';
import { UpsertBalanceDto } from './dto/upsert-balance.dto';
import { LeaveBalance } from './leave-balance.entity';

export type BalanceView = {
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

function currentYear() {
  return yearOf(todayUtc());
}

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(LeaveBalance) private readonly balances: Repository<LeaveBalance>,
    @InjectRepository(LeaveRequest) private readonly requests: Repository<LeaveRequest>,
    private readonly leaveTypes: LeaveTypesService,
    private readonly employees: EmployeesService,
    private readonly dataSource: DataSource,
  ) {}

  mine(userId: string, year: number = currentYear()) {
    return this.summary(userId, year);
  }

  async forEmployee(userId: string, year: number = currentYear()) {
    const employee = await this.employees.findApplicant(userId);
    if (!employee) throw new NotFoundException('Employee not found');
    return this.summary(userId, year);
  }

  async upsert(dto: UpsertBalanceDto) {
    const employee = await this.employees.findApplicant(dto.userId);
    if (!employee) throw new NotFoundException('Employee not found');
    await this.leaveTypes.getActiveOrThrow(dto.leaveTypeId);

    await this.dataSource
      .transaction(async (m) => {
        const existing = await m.findOne(LeaveBalance, {
          where: { userId: dto.userId, leaveTypeId: dto.leaveTypeId, year: dto.year },
          lock: { mode: 'pessimistic_write' },
        });
        if (!existing) {
          await m.save(m.create(LeaveBalance, { ...dto, usedDays: 0 }));
          return;
        }
        if (dto.totalDays < existing.usedDays) {
          throw new BadRequestException(
            `Total days can't be less than the ${existing.usedDays} day(s) already used`,
          );
        }
        existing.totalDays = dto.totalDays;
        await m.save(existing);
      })
      .catch((err: unknown) =>
        rethrowDbError(err, {
          conflict: 'This balance was just changed, please try again',
        }),
      );

    const rows = await this.summary(dto.userId, dto.year);
    return rows.find((row) => row.leaveTypeId === dto.leaveTypeId);
  }

  // one row per active leave type, even if no balance was set yet
  private async summary(userId: string, year: number): Promise<BalanceView[]> {
    const [types, balances, pending] = await Promise.all([
      this.leaveTypes.findActive(),
      this.balances.find({ where: { userId, year } }),
      this.pendingByType(userId, year),
    ]);
    const balanceByType = new Map(balances.map((b) => [b.leaveTypeId, b]));

    return types.map((type) => {
      const balance = balanceByType.get(type.id);
      const totalDays = balance?.totalDays ?? 0;
      const usedDays = balance?.usedDays ?? 0;
      const pendingDays = pending.get(type.id) ?? 0;
      return {
        leaveTypeId: type.id,
        leaveTypeName: type.name,
        defaultDays: type.defaultDays,
        year,
        totalDays,
        usedDays,
        pendingDays,
        // days left = total - used - pending (pending days are already promised)
        availableDays: Math.max(0, totalDays - usedDays - pendingDays),
        configured: Boolean(balance),
      };
    });
  }

  private async pendingByType(userId: string, year: number) {
    const rows = await this.requests
      .createQueryBuilder('r')
      .select('r.leaveTypeId', 'leaveTypeId')
      .addSelect('SUM(r.days)::int', 'days')
      .where('r.userId = :userId', { userId })
      .andWhere('r.status = :status', { status: 'pending' })
      .andWhere('r.startDate BETWEEN :start AND :end', {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      })
      .groupBy('r.leaveTypeId')
      .getRawMany<{ leaveTypeId: string; days: number }>();
    return new Map(rows.map((row) => [row.leaveTypeId, row.days]));
  }
}
