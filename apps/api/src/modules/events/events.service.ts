import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { Rsvp, RsvpStatus } from '../rsvps/entities/rsvp.entity';
import {
  WaitlistEntry,
  WaitlistStatus,
} from '../waitlist/entities/waitlist-entry.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import type { JwtUser } from '../../common/auth';

@Injectable()
export class EventsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Rsvp)
    private readonly rsvpsRepository: Repository<Rsvp>,
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepository: Repository<WaitlistEntry>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const targetStatus = createEventDto.status || EventStatus.PUBLISHED;

    if (targetStatus === EventStatus.PUBLISHED) {
      if (
        !createEventDto.title ||
        !createEventDto.description ||
        !createEventDto.location ||
        !createEventDto.startDate ||
        !createEventDto.endDate ||
        !createEventDto.capacity
      ) {
        throw new BadRequestException(
          'Title, Description, Location, Start Date, End Date, and Capacity are required to publish an event.',
        );
      }
    }

    const event = this.eventsRepository.create({
      ...createEventDto,
      organizerId,
      status: targetStatus,
    });
    return this.eventsRepository.save(event);
  }

  async findAll(queryDto: QueryEventsDto, user?: JwtUser) {
    const {
      q,
      category,
      status,
      organizerId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      includeAllStatuses = false,
      includeDeleted = false,
    } = queryDto;

    const isAdmin = user?.role === 'admin';
    const isOrganizerOwner =
      user &&
      (user.role === 'admin' || user.role === 'staff') &&
      organizerId &&
      organizerId === user.id;

    // Security check: Only admins or the event organizer owner can query DRAFT events or use includeAllStatuses/includeDeleted
    const canAccessInternalStatuses = Boolean(isAdmin || isOrganizerOwner);

    const effectiveIncludeAllStatuses = canAccessInternalStatuses
      ? Boolean(includeAllStatuses)
      : false;
    const effectiveIncludeDeleted = canAccessInternalStatuses
      ? Boolean(includeDeleted)
      : false;

    let effectiveStatus = status;
    if (!canAccessInternalStatuses && status === EventStatus.DRAFT) {
      // Public/unauthorized users requesting DRAFT events are forced to PUBLISHED catalog
      effectiveStatus = EventStatus.PUBLISHED;
    }

    const sanitizedPage = Math.max(1, Math.floor(Number(page) || 1));
    const sanitizedLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 10)));
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const qb = this.eventsRepository.createQueryBuilder('event');

    if (effectiveIncludeDeleted) {
      qb.withDeleted();
    } else {
      qb.where('event.deletedAt IS NULL');
    }

    if (organizerId) {
      qb.andWhere('event.organizerId = :organizerId', { organizerId });
    }

    if (q) {
      qb.andWhere(
        '(LOWER(event.title) LIKE LOWER(:q) OR LOWER(event.description) LIKE LOWER(:q) OR LOWER(event.location) LIKE LOWER(:q))',
        {
          q: `%${q}%`,
        },
      );
    }

    if (category) {
      qb.andWhere('event.category = :category', { category });
    }

    if (effectiveStatus) {
      qb.andWhere('event.status = :status', { status: effectiveStatus });
    } else if (!effectiveIncludeAllStatuses) {
      // Default to PUBLISHED for public catalog queries
      qb.andWhere('event.status = :defaultStatus', {
        defaultStatus: EventStatus.PUBLISHED,
      });
    }

    if (startDate) {
      qb.andWhere('event.startDate >= :startDate', { startDate });
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        const isDateOnlyString =
          typeof endDate === 'string' &&
          /^\d{4}-\d{2}-\d{2}$/.test((endDate as string).trim());
        const isMidnight = end.getUTCHours() === 0 && end.getUTCMinutes() === 0;
        if (isDateOnlyString || isMidnight) {
          end.setUTCHours(23, 59, 59, 999);
        }
        qb.andWhere('event.endDate <= :endDate', { endDate: end });
      } else {
        qb.andWhere('event.endDate <= :endDate', { endDate });
      }
    }

    // Add DB subqueries for yes_count and waitlist_count (Executed in 1 single DB call)
    qb.addSelect(
      (subQuery) =>
        subQuery
          .select('COALESCE(SUM(1 + r.guestCount), 0)', 'yesCount')
          .from(Rsvp, 'r')
          .where('r.eventId = event.id AND r.status = :yesStatus', {
            yesStatus: RsvpStatus.YES,
          }),
      'yesCount',
    );

    qb.addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(w.id)', 'waitlistCount')
          .from(WaitlistEntry, 'w')
          .where('w.eventId = event.id AND w.status = :waitingStatus', {
            waitingStatus: WaitlistStatus.WAITING,
          }),
      'waitlistCount',
    );

    qb.orderBy('event.startDate', 'ASC').offset(skip).limit(sanitizedLimit);

    const { entities, raw } = await qb.getRawAndEntities();
    const total = await qb.getCount();

    const items = entities.map((event, index) => {
      const rawRow = raw[index] || {};
      const yesCount = parseInt(rawRow.yesCount ?? rawRow.yescount ?? '0', 10);
      const waitlistCount = parseInt(
        rawRow.waitlistCount ?? rawRow.waitlistcount ?? '0',
        10,
      );
      return this.calculateEventMetrics(event, yesCount, waitlistCount);
    });

    return {
      items,
      meta: {
        total,
        page: sanitizedPage,
        limit: sanitizedLimit,
        totalPages: Math.ceil(total / sanitizedLimit),
      },
    };
  }

  async findOne(id: string, user?: JwtUser) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    if (event.deletedAt) {
      const isAdmin = user?.role === 'admin';
      const isOrganizer = user?.id === event.organizerId;
      if (!isAdmin && !isOrganizer) {
        throw new NotFoundException(`Event with ID "${id}" not found.`);
      }
    }

    const yesResult = await this.rsvpsRepository
      .createQueryBuilder('r')
      .select('COALESCE(SUM(1 + r.guestCount), 0)', 'yesCount')
      .where('r.eventId = :id AND r.status = :status', { id, status: RsvpStatus.YES })
      .getRawOne();
    const yesCount = parseInt(yesResult?.yesCount ?? yesResult?.yescount ?? '0', 10);

    const noCount = await this.rsvpsRepository.count({
      where: { eventId: id, status: RsvpStatus.NO },
    });
    const maybeCount = await this.rsvpsRepository.count({
      where: { eventId: id, status: RsvpStatus.MAYBE },
    });
    const waitlistCount = await this.waitlistRepository.count({
      where: { eventId: id, status: WaitlistStatus.WAITING },
    });

    return {
      ...this.calculateEventMetrics(event, yesCount, waitlistCount),
      noCount,
      maybeCount,
    };
  }

  private calculateEventMetrics(event: Event, yesCount: number, waitlistCount: number) {
    const isCompleted = event.endDate ? new Date(event.endDate) < new Date() : false;
    return {
      ...event,
      yesCount,
      waitlistCount,
      spotsLeft: Math.max(0, event.capacity - yesCount),
      isFull: yesCount >= event.capacity,
      isCompleted,
    };
  }

  async publish(id: string, userId: string, role: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event || event.deletedAt) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    if (role !== 'admin' && event.organizerId !== userId) {
      throw new ForbiddenException('You are not authorized to publish this event.');
    }

    if (
      !event.title ||
      !event.description ||
      !event.location ||
      !event.startDate ||
      !event.endDate ||
      !event.capacity
    ) {
      throw new BadRequestException(
        'Cannot publish event. Please ensure Title, Description, Location, Start Date, End Date, and Capacity are all provided.',
      );
    }

    event.status = EventStatus.PUBLISHED;
    return this.eventsRepository.save(event);
  }

  async cancel(
    id: string,
    userId: string,
    role: string,
  ): Promise<{ success: boolean; message: string }> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event || event.deletedAt) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    if (role !== 'admin' && event.organizerId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this event.');
    }

    if (event.status === EventStatus.CANCELLED) {
      return { success: true, message: 'Event is already cancelled.' };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Update event status to CANCELLED
      await queryRunner.manager.update(Event, { id }, { status: EventStatus.CANCELLED });

      // 2. Invalidate all ISSUED tickets for this event
      await queryRunner.manager.update(
        Ticket,
        { eventId: id, status: TicketStatus.ISSUED },
        { status: TicketStatus.CANCELLED },
      );

      // 3. Update all pending waitlists to CANCELLED
      await queryRunner.manager.update(
        WaitlistEntry,
        { eventId: id, status: WaitlistStatus.WAITING },
        { status: WaitlistStatus.CANCELLED },
      );

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: `Event "${event.title}" has been cancelled and associated tickets have been invalidated.`,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    role: string,
  ): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event || event.deletedAt) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    if (role !== 'admin' && event.organizerId !== userId) {
      throw new ForbiddenException('You are not authorized to update this event.');
    }

    Object.assign(event, updateEventDto);

    if (event.status === EventStatus.PUBLISHED) {
      if (
        !event.title ||
        !event.description ||
        !event.location ||
        !event.startDate ||
        !event.endDate ||
        !event.capacity
      ) {
        throw new BadRequestException(
          'Cannot save published event. Title, Description, Location, Start Date, End Date, and Capacity must be provided.',
        );
      }
    }

    return this.eventsRepository.save(event);
  }

  async remove(
    id: string,
    userId: string,
    role: string,
  ): Promise<{ success: boolean; message: string }> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event || event.deletedAt) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    if (role !== 'admin' && event.organizerId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this event.');
    }

    await this.eventsRepository.softDelete(id);
    return { success: true, message: `Event "${event.title}" has been soft-deleted.` };
  }

  async getAnalytics(id: string, userId: string, role: string) {
    const event = await this.eventsRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found.`);
    }

    if (role !== 'admin' && role !== 'staff' && event.organizerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view analytics for this event.',
      );
    }

    const yesResult = await this.rsvpsRepository
      .createQueryBuilder('r')
      .select('COALESCE(SUM(1 + r.guestCount), 0)', 'yesCount')
      .where('r.eventId = :id AND r.status = :status', { id, status: RsvpStatus.YES })
      .getRawOne();
    const yesCount = parseInt(yesResult?.yesCount ?? yesResult?.yescount ?? '0', 10);
    const noCount = await this.rsvpsRepository.count({
      where: { eventId: id, status: RsvpStatus.NO },
    });
    const maybeCount = await this.rsvpsRepository.count({
      where: { eventId: id, status: RsvpStatus.MAYBE },
    });
    const waitlistCount = await this.waitlistRepository.count({
      where: { eventId: id, status: WaitlistStatus.WAITING },
    });
    const ticketsIssued = await this.ticketsRepository.count({
      where: { eventId: id, status: TicketStatus.ISSUED },
    });
    const ticketsUsed = await this.ticketsRepository.count({
      where: { eventId: id, status: TicketStatus.USED },
    });
    const ticketsCancelled = await this.ticketsRepository.count({
      where: { eventId: id, status: TicketStatus.CANCELLED },
    });

    const activeTicketsTotal = ticketsIssued + ticketsUsed;
    const totalTicketsGenerated = activeTicketsTotal + ticketsCancelled;

    return {
      eventId: event.id,
      title: event.title,
      capacity: event.capacity,
      rsvps: {
        yes: yesCount,
        no: noCount,
        maybe: maybeCount,
        total: yesCount + noCount + maybeCount,
      },
      waitlistCount,
      tickets: {
        issued: ticketsIssued,
        used: ticketsUsed,
        cancelled: ticketsCancelled,
        totalGenerated: totalTicketsGenerated,
        occupancyRate:
          event.capacity > 0 ? Math.round((yesCount / event.capacity) * 100) : 0,
        checkInRate:
          activeTicketsTotal > 0
            ? Math.round((ticketsUsed / activeTicketsTotal) * 100)
            : 0,
      },
    };
  }
}
