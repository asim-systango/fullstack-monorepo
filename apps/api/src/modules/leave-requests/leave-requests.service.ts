import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  EntityManager,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { rethrowDbError } from '../../common/database';
import { addDays, todayIst, yearOf } from '../../common/dates';
import { pageParams, type Paginated } from '../../common/pagination';
import { LeaveBalance } from '../balances/leave-balance.entity';
import { EmployeesService, type Employee } from '../employees';
import { HolidaysService } from '../holidays';
import { LeaveTypesService } from '../leave-types';
import { ApproveLeaveRequestDto, RejectLeaveRequestDto } from './dto/decision.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import {
  AwayQueryDto,
  ListLeaveRequestsQueryDto,
  MyLeaveRequestsQueryDto,
  QuoteQueryDto,
} from './dto/leave-request-queries.dto';
import { LeaveRequest } from './leave-request.entity';
import { toLeaveRequestView, type LeaveRequestView } from './leave-request.view';
import {
  assertCanDecide,
  assertDateRange,
  assertFilterRange,
  assertPending,
  availableDays,
  fieldError,
} from './leave-rules';
import { ACTIVE_STATUSES, REMOVABLE_STATUSES } from './leave-status';
import { countWorkingDays, workingDates } from './working-days';

const LOCK = { mode: 'pessimistic_write' } as const;
const AWAY_DAYS = 14;

function notFound() {
  return new NotFoundException('Leave request not found');
}

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest) private readonly requests: Repository<LeaveRequest>,
    private readonly dataSource: DataSource,
    private readonly leaveTypes: LeaveTypesService,
    private readonly holidays: HolidaysService,
    private readonly employees: EmployeesService,
  ) {}

  async quote(query: QuoteQueryDto) {
    assertDateRange(query.startDate, query.endDate);
    const holidays = await this.holidays.inRange(query.startDate, query.endDate);
    const days = countWorkingDays(
      query.startDate,
      query.endDate,
      new Set(holidays.map((h) => h.date)),
    );
    return {
      startDate: query.startDate,
      endDate: query.endDate,
      days,
      holidays: holidays.map((h) => ({ date: h.date, name: h.name })),
    };
  }

  async apply(user: JwtUser, dto: CreateLeaveRequestDto) {
    assertDateRange(dto.startDate, dto.endDate);
    const holidays = await this.holidays.datesBetween(dto.startDate, dto.endDate);
    const days = countWorkingDays(dto.startDate, dto.endDate, holidays);
    if (days < 1) throw fieldError('endDate', 'No working days in this range');
    const year = yearOf(dto.startDate);

    const id = await this.dataSource
      .transaction(async (m) => {
        // shared lock on the type, so it can't be archived while this request is being saved
        const type = await this.leaveTypes.lockActiveById(
          m,
          dto.leaveTypeId,
          'pessimistic_read',
        );
        if (!type) throw fieldError('leaveTypeId', 'Please pick a valid leave type');

        // then lock the balance row, so two requests sent at the same time can't both pass
        const balance = await m.findOne(LeaveBalance, {
          where: { userId: user.id, leaveTypeId: type.id, year },
          lock: LOCK,
        });
        if (!balance) {
          throw new BadRequestException(
            `You have no ${type.name} balance for ${year}. Ask HR to set your balance.`,
          );
        }

        const clash = await this.findOverlap(m, user.id, dto.startDate, dto.endDate);
        if (clash) {
          throw new ConflictException(
            `These dates overlap your ${clash.status} request from ${clash.startDate} to ${clash.endDate}`,
          );
        }

        const left = availableDays(balance, await this.pendingDays(m, balance));
        if (days > left) {
          throw new BadRequestException(
            `Not enough ${type.name} days: this request needs ${days}, you have ${left} left`,
          );
        }

        const saved = await m.save(
          m.create(LeaveRequest, {
            userId: user.id,
            leaveTypeId: type.id,
            startDate: dto.startDate,
            endDate: dto.endDate,
            days,
            reason: dto.reason,
            status: 'pending',
          }),
        );
        return saved.id;
      })
      .catch((err: unknown) =>
        // the db exclusion constraint catches overlaps the check above can miss (other leave type, races)
        rethrowDbError(err, {
          conflict: 'These dates overlap another of your pending or approved requests',
        }),
      );

    return this.viewById(id);
  }

  listMine(user: JwtUser, query: MyLeaveRequestsQueryDto) {
    return this.list(query, { userId: user.id });
  }

  listAll(user: JwtUser, query: ListLeaveRequestsQueryDto) {
    const includeDeleted = query.includeDeleted === 'true';
    if (includeDeleted && user.role !== 'admin') {
      throw new ForbiddenException('Only admins can see deleted requests');
    }
    return this.list(query, { userId: query.userId, includeDeleted });
  }

  async findOne(user: JwtUser, id: string) {
    const request = await this.requests.findOne({
      where: { id },
      relations: { leaveType: true },
      withDeleted: user.role === 'admin',
    });
    // employees only see their own, someone else's request looks like it doesn't exist
    if (!request || (user.role === 'user' && request.userId !== user.id))
      throw notFound();
    return this.toView(request);
  }

  async cancel(user: JwtUser, id: string) {
    await this.dataSource.transaction(async (m) => {
      const request = await this.lockRequest(m, id);
      if (request.userId !== user.id) {
        throw new ForbiddenException('You can only cancel your own requests');
      }
      assertPending(request.status, 'cancelled');
      await m.update(LeaveRequest, request.id, { status: 'cancelled' });
    });
    return this.viewById(id);
  }

  approve(actor: JwtUser, id: string, dto: ApproveLeaveRequestDto) {
    return this.decide(actor, id, 'approved', dto.comment);
  }

  reject(actor: JwtUser, id: string, dto: RejectLeaveRequestDto) {
    return this.decide(actor, id, 'rejected', dto.comment);
  }

  // soft delete, only for closed requests so balances are never affected
  async remove(user: JwtUser, id: string) {
    const request = await this.requests.findOne({ where: { id } });
    if (!request) throw notFound();
    const isAdmin = user.role === 'admin';
    if (!isAdmin && request.userId !== user.id) {
      throw new ForbiddenException('You can only remove your own requests');
    }
    if (!REMOVABLE_STATUSES.includes(request.status)) {
      throw new BadRequestException('Only cancelled or rejected requests can be removed');
    }
    // a rejection is the manager's record, only an admin can hide it
    if (request.status === 'rejected' && !isAdmin) {
      throw new ForbiddenException('Only an admin can remove a rejected request');
    }
    await this.requests.softDelete(id);
    return { id, deleted: true };
  }

  async away(query: AwayQueryDto) {
    const from = query.from ?? todayIst();
    const to = addDays(from, AWAY_DAYS - 1);
    const [requests, holidays] = await Promise.all([
      this.requests.find({
        where: {
          status: 'approved',
          startDate: LessThanOrEqual(to),
          endDate: MoreThanOrEqual(from),
        },
        relations: { leaveType: true },
        order: { startDate: 'ASC' },
      }),
      this.holidays.inRange(from, to),
    ]);
    const people = await this.employees.byIds(requests.map((r) => r.userId));
    const holidayDates = new Set(holidays.map((h) => h.date));

    // only working days, nobody is "away" on a weekend
    const days = workingDates(from, to, holidayDates).map((date) => ({
      date,
      people: requests
        .filter((r) => r.startDate <= date && r.endDate >= date)
        .map((r) => awayEntry(r, people)),
    }));
    return {
      from,
      to,
      days,
      holidays: holidays.map((h) => ({ date: h.date, name: h.name })),
    };
  }

  // both approve and reject: same locks and checks, only approve touches the balance
  private async decide(
    actor: JwtUser,
    id: string,
    outcome: 'approved' | 'rejected',
    comment?: string,
  ) {
    await this.dataSource.transaction(async (m) => {
      const request = await this.lockRequest(m, id);
      const requester = await this.employees.findById(request.userId, m);
      assertCanDecide(actor, request.userId, requester?.role);
      assertPending(request.status, outcome);

      if (outcome === 'approved') {
        await this.recountDays(m, request);
        await this.chargeBalance(m, request);
      }

      await m.update(LeaveRequest, request.id, {
        status: outcome,
        managerId: actor.id,
        managerComment: comment ?? null,
        decidedAt: new Date(),
      });
    });
    return this.viewById(id);
  }

  // a holiday may have been added since the request was made, so count again before charging
  private async recountDays(m: EntityManager, request: LeaveRequest) {
    const holidays = await this.holidays.datesBetween(request.startDate, request.endDate);
    const days = countWorkingDays(request.startDate, request.endDate, holidays);
    if (days < 1) {
      throw new BadRequestException(
        'No working days left in this request, ask the employee to cancel it',
      );
    }
    if (days !== request.days) {
      await m.update(LeaveRequest, request.id, { days });
      request.days = days;
    }
  }

  // runs inside the approve transaction, if anything fails the status change is rolled back too
  private async chargeBalance(m: EntityManager, request: LeaveRequest) {
    const balance = await m.findOne(LeaveBalance, {
      where: {
        userId: request.userId,
        leaveTypeId: request.leaveTypeId,
        year: yearOf(request.startDate),
      },
      lock: LOCK,
    });
    if (!balance) {
      throw new BadRequestException(
        'This employee has no balance set for this leave type',
      );
    }
    if (balance.usedDays + request.days > balance.totalDays) {
      throw new BadRequestException(
        `Not enough days to approve: ${balance.totalDays - balance.usedDays} left, request needs ${request.days}`,
      );
    }
    await m.increment(LeaveBalance, { id: balance.id }, 'usedDays', request.days);
  }

  // no relations here: postgres can't do FOR UPDATE together with the outer join
  private async lockRequest(m: EntityManager, id: string) {
    const request = await m.findOne(LeaveRequest, { where: { id }, lock: LOCK });
    if (!request) throw notFound();
    return request;
  }

  private findOverlap(
    m: EntityManager,
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    // two ranges overlap when existing.start <= new.end and existing.end >= new.start
    return m.findOne(LeaveRequest, {
      where: {
        userId,
        status: In([...ACTIVE_STATUSES]),
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
      order: { startDate: 'ASC' },
    });
  }

  private async pendingDays(m: EntityManager, balance: LeaveBalance) {
    const sum = await m.sum(LeaveRequest, 'days', {
      userId: balance.userId,
      leaveTypeId: balance.leaveTypeId,
      status: 'pending',
      startDate: Between(`${balance.year}-01-01`, `${balance.year}-12-31`),
    });
    return sum ?? 0;
  }

  private async list(
    query: MyLeaveRequestsQueryDto,
    scope: { userId?: string; includeDeleted?: boolean },
  ): Promise<Paginated<LeaveRequestView>> {
    assertFilterRange(query.from, query.to);
    const { page, limit, skip } = pageParams(query);

    const qb = this.requests
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.leaveType', 'type')
      .orderBy('r.startDate', 'DESC')
      .addOrderBy('r.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (scope.includeDeleted) qb.withDeleted();
    if (scope.userId) qb.andWhere('r.userId = :userId', { userId: scope.userId });
    if (query.status) qb.andWhere('r.status = :status', { status: query.status });
    if (query.leaveTypeId) {
      qb.andWhere('r.leaveTypeId = :leaveTypeId', { leaveTypeId: query.leaveTypeId });
    }
    // date filter = any request that overlaps [from, to]
    if (query.from) qb.andWhere('r.endDate >= :from', { from: query.from });
    if (query.to) qb.andWhere('r.startDate <= :to', { to: query.to });

    const [rows, total] = await qb.getManyAndCount();
    const people = await this.peopleFor(rows);
    return { items: rows.map((r) => toLeaveRequestView(r, people)), total, page, limit };
  }

  private async viewById(id: string) {
    const request = await this.requests.findOne({
      where: { id },
      relations: { leaveType: true },
      withDeleted: true,
    });
    if (!request) throw notFound();
    return this.toView(request);
  }

  private async toView(request: LeaveRequest) {
    return toLeaveRequestView(request, await this.peopleFor([request]));
  }

  private peopleFor(requests: readonly LeaveRequest[]) {
    const ids = requests.flatMap((r) =>
      r.managerId ? [r.userId, r.managerId] : [r.userId],
    );
    return this.employees.byIds(ids);
  }
}

function awayEntry(request: LeaveRequest, people: Map<string, Employee>) {
  return {
    requestId: request.id,
    userId: request.userId,
    name: people.get(request.userId)?.name ?? 'Unknown user',
    leaveType: request.leaveType?.name ?? '',
    startDate: request.startDate,
    endDate: request.endDate,
  };
}
