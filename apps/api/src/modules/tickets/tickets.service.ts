import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Ticket, TicketStatus } from './ticket.entity';
import { Message, MessageType } from './message.entity';
import { Category } from '../categories/category.entity';
import { SlaPolicy } from '../categories/sla-policy.entity';
import { OutboxEvent } from '../events/outbox-event.entity';
import { SlaDeadlineCalculator } from './sla-deadline.helper';
import { TicketStatusMachine } from './ticket-status.machine';
import { TicketEventsService } from './ticket-events.service';
import { CreateTicketDto, AssignTicketDto, UpdateStatusDto } from './dto';
import { SlaPriority } from '../categories/sla-priority.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SlaPolicy)
    private readonly slaPolicyRepository: Repository<SlaPolicy>,
    @InjectRepository(OutboxEvent)
    private readonly outboxRepository: Repository<OutboxEvent>,
    private readonly dataSource: DataSource,
    private readonly statusMachine: TicketStatusMachine,
    private readonly eventsService: TicketEventsService,
  ) {}

  /**
   * Atomic ticket creation: ticket + initial message + audit event + outbox event.
   */
  async create(userId: string, dto: CreateTicketDto): Promise<Ticket> {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
      relations: ['slaPolicies'],
    });

    if (!category) {
      throw new BadRequestException(`Category with ID '${dto.categoryId}' not found.`);
    }

    const priority = dto.priority ?? SlaPriority.MEDIUM;
    const policy = category.slaPolicies?.find((p) => p.priority === priority);
    const deadlines = SlaDeadlineCalculator.compute(policy, priority, new Date());

    return this.dataSource.transaction(async (manager) => {
      const ticketRepo = manager.getRepository(Ticket);
      const messageRepo = manager.getRepository(Message);
      const outboxRepo = manager.getRepository(OutboxEvent);

      const ticket = ticketRepo.create({
        subject: dto.subject,
        categoryId: dto.categoryId,
        userId,
        priority,
        status: TicketStatus.OPEN,
        version: 1,
        firstResponseDueAt: deadlines.firstResponseDueAt,
        resolutionDueAt: deadlines.resolutionDueAt,
        metadata: dto.metadata || {},
      });

      const savedTicket = await ticketRepo.save(ticket);

      // Create initial message
      const message = messageRepo.create({
        ticketId: savedTicket.id,
        userId,
        messageType: MessageType.PUBLIC,
        body: dto.body,
        metadata: {},
      });
      await messageRepo.save(message);

      // Audit event
      await this.eventsService.logEvent(
        savedTicket.id,
        userId,
        'TICKET_CREATED',
        null,
        {
          subject: savedTicket.subject,
          categoryId: savedTicket.categoryId,
          priority: savedTicket.priority,
          status: savedTicket.status,
        },
        null,
        manager,
      );

      // Outbox event
      const outbox = outboxRepo.create({
        aggregateType: 'TICKET',
        aggregateId: savedTicket.id,
        eventType: 'ticket.created',
        payload: {
          ticketId: savedTicket.id,
          userId,
          categoryId: savedTicket.categoryId,
          priority: savedTicket.priority,
          status: savedTicket.status,
        },
      });
      await outboxRepo.save(outbox);

      // Fetch full ticket with category relation
      const fullTicket = await ticketRepo.findOne({
        where: { id: savedTicket.id },
        relations: ['category'],
      });

      return fullTicket || savedTicket;
    });
  }

  /**
   * Reassigns ticket to a staff member with optimistic concurrency locking and audit logging.
   */
  async assign(ticketId: string, actorId: string, dto: AssignTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID '${ticketId}' not found.`);
    }

    if (dto.expectedVersion !== undefined && ticket.version !== dto.expectedVersion) {
      throw new ConflictException(
        `Concurrent modification conflict: expected version ${dto.expectedVersion}, but current version is ${ticket.version}.`,
      );
    }

    const oldAssigneeId = ticket.assigneeId;

    const result = await this.ticketRepository
      .createQueryBuilder()
      .update(Ticket)
      .set({
        assigneeId: dto.assigneeId,
        version: () => 'version + 1',
      } as QueryDeepPartialEntity<Ticket>)
      .where('id = :id AND version = :version', { id: ticketId, version: ticket.version })
      .execute();

    if (result.affected === 0) {
      throw new ConflictException(
        'Concurrent modification conflict: ticket was updated by another request.',
      );
    }

    // Log audit event
    await this.eventsService.logEvent(
      ticketId,
      actorId,
      'ASSIGNMENT_CHANGE',
      { assigneeId: oldAssigneeId },
      { assigneeId: dto.assigneeId },
      dto.reason ?? null,
    );

    // Save outbox event
    const outbox = this.outboxRepository.create({
      aggregateType: 'TICKET',
      aggregateId: ticketId,
      eventType: 'ticket.assigned',
      payload: {
        ticketId,
        actorId,
        assigneeId: dto.assigneeId,
        reason: dto.reason ?? null,
      },
    });
    await this.outboxRepository.save(outbox);

    return this.getTicketById(ticketId);
  }

  /**
   * Updates ticket status enforcing status machine transitions, optimistic locking, and audit ledger logging.
   */
  async updateStatus(
    ticketId: string,
    actorId: string,
    dto: UpdateStatusDto,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID '${ticketId}' not found.`);
    }

    // Validate state transition
    this.statusMachine.validateTransition(ticket.status, dto.status);

    if (dto.expectedVersion !== undefined && ticket.version !== dto.expectedVersion) {
      throw new ConflictException(
        `Concurrent modification conflict: expected version ${dto.expectedVersion}, but current version is ${ticket.version}.`,
      );
    }

    const oldStatus = ticket.status;
    const updateValues: QueryDeepPartialEntity<Ticket> = {
      status: dto.status,
      version: () => 'version + 1',
    };

    if (dto.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
      updateValues.resolvedAt = new Date();
    }
    if (dto.status === TicketStatus.CLOSED && !ticket.closedAt) {
      updateValues.closedAt = new Date();
    }

    const result = await this.ticketRepository
      .createQueryBuilder()
      .update(Ticket)
      .set(updateValues)
      .where('id = :id AND version = :version', { id: ticketId, version: ticket.version })
      .execute();

    if (result.affected === 0) {
      throw new ConflictException(
        'Concurrent modification conflict: ticket was updated by another request.',
      );
    }

    // Log audit event
    await this.eventsService.logEvent(
      ticketId,
      actorId,
      'STATUS_CHANGE',
      { status: oldStatus },
      { status: dto.status },
      dto.reason ?? null,
    );

    // Outbox event
    const outbox = this.outboxRepository.create({
      aggregateType: 'TICKET',
      aggregateId: ticketId,
      eventType: 'ticket.status_changed',
      payload: {
        ticketId,
        actorId,
        oldStatus,
        newStatus: dto.status,
        reason: dto.reason ?? null,
      },
    });
    await this.outboxRepository.save(outbox);

    return this.getTicketById(ticketId);
  }

  /**
   * Finds ticket by ID.
   */
  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID '${id}' not found.`);
    }

    return ticket;
  }

  /**
   * Returns audit event trail for a ticket.
   */
  async getTicketEvents(ticketId: string) {
    await this.getTicketById(ticketId); // Ensures 404 if ticket doesn't exist
    return this.eventsService.getEventsByTicketId(ticketId);
  }
}
