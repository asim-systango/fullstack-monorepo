import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Ticket, TicketStatus } from './ticket.entity';
import { Message, MessageType } from './message.entity';
import { Attachment } from './attachment.entity';
import { Category } from '../categories/category.entity';
import { SlaPolicy } from '../categories/sla-policy.entity';
import { OutboxEvent } from '../events/outbox-event.entity';
import { SlaDeadlineCalculator } from './sla-deadline.helper';
import { TicketStatusMachine } from './ticket-status.machine';
import { TicketEventsService } from './ticket-events.service';
import {
  CreateTicketDto,
  AssignTicketDto,
  UpdateStatusDto,
  TicketFilterDto,
  CreateMessageDto,
} from './dto';
import { SlaPriority } from '../categories/sla-priority.enum';
import { JwtUser } from '../../common/auth';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
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
   * Paginated list of tickets with filters, customer scoping, and FTS search.
   */
  async findAll(query: TicketFilterDto, user: JwtUser) {
    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.category', 'category')
      .leftJoinAndSelect('category.slaPolicies', 'slaPolicies');

    // Customer scoping: customers only see their own tickets
    if (user.role === 'user') {
      qb.andWhere('ticket.userId = :userId', { userId: user.id });
    }

    // Soft delete filtering
    if (!query.includeDeleted || user.role === 'user') {
      qb.andWhere('ticket.deletedAt IS NULL');
    }

    // Filters
    if (query.categoryId) {
      qb.andWhere('ticket.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }

    if (query.priority) {
      qb.andWhere('ticket.priority = :priority', { priority: query.priority });
    }

    if (query.assigneeId === 'unassigned') {
      qb.andWhere('ticket.assigneeId IS NULL');
    } else if (query.assigneeId) {
      qb.andWhere('ticket.assigneeId = :assigneeId', { assigneeId: query.assigneeId });
    }

    // Full text search or fallback ILIKE
    if (query.search && query.search.trim() !== '') {
      const searchTerm = query.search.trim();
      qb.andWhere(
        `(ticket.searchVector @@ plainto_tsquery('english', :searchTerm) OR ticket.subject ILIKE :searchLike)`,
        { searchTerm, searchLike: `%${searchTerm}%` },
      );
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    qb.orderBy('ticket.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Finds ticket by ID with customer ownership validation.
   */
  async findOne(id: string, user: JwtUser): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['category', 'category.slaPolicies'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID '${id}' not found.`);
    }

    if (
      user.role === 'user' &&
      (ticket.userId !== user.id || ticket.deletedAt !== null)
    ) {
      throw new NotFoundException(`Ticket with ID '${id}' not found.`);
    }

    return ticket;
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
   * Retrieves messages for a ticket. Isolates internal notes for staff/admin only.
   */
  async getMessages(ticketId: string, user: JwtUser): Promise<Message[]> {
    await this.findOne(ticketId, user); // Validates ticket existence and customer ownership

    const qb = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .leftJoinAndSelect('message.user', 'user')
      .where('message.ticketId = :ticketId', { ticketId });

    if (user.role === 'user') {
      qb.andWhere('message.messageType = :publicType', {
        publicType: MessageType.PUBLIC,
      });
    }

    qb.orderBy('message.createdAt', 'ASC');

    return qb.getMany();
  }

  /**
   * Adds a reply or internal staff note to a ticket thread.
   */
  async createMessage(
    ticketId: string,
    user: JwtUser,
    dto: CreateMessageDto,
  ): Promise<Message> {
    const ticket = await this.findOne(ticketId, user);

    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException('Cannot reply to a closed ticket.');
    }

    const messageType = dto.isInternal
      ? MessageType.INTERNAL_NOTE
      : (dto.messageType ?? MessageType.PUBLIC);
    if (messageType === MessageType.INTERNAL_NOTE && user.role === 'user') {
      throw new ForbiddenException('Only staff members can post internal notes.');
    }

    return this.dataSource.transaction(async (manager) => {
      const messageRepo = manager.getRepository(Message);
      const attachmentRepo = manager.getRepository(Attachment);
      const ticketRepo = manager.getRepository(Ticket);
      const outboxRepo = manager.getRepository(OutboxEvent);

      const message = messageRepo.create({
        ticketId,
        userId: user.id,
        messageType,
        body: dto.body,
        metadata: {},
      });
      const savedMessage = await messageRepo.save(message);

      if (dto.attachments && dto.attachments.length > 0) {
        const attachments = dto.attachments.map((att) =>
          attachmentRepo.create({
            messageId: savedMessage.id,
            url: att.url,
            filename: att.filename,
            mimeType: att.mimeType || 'application/octet-stream',
            sizeBytes: att.sizeBytes || 0,
          }),
        );
        await attachmentRepo.save(attachments);
      }

      // Record staff first response timestamp if applicable
      if (
        user.role !== 'user' &&
        !ticket.firstResponseAt &&
        messageType === MessageType.PUBLIC
      ) {
        await ticketRepo.update(ticketId, { firstResponseAt: new Date() });
      }

      // Outbox event
      const outbox = outboxRepo.create({
        aggregateType: 'TICKET',
        aggregateId: ticketId,
        eventType: 'ticket.replied',
        payload: {
          ticketId,
          messageId: savedMessage.id,
          userId: user.id,
          messageType,
        },
      });
      await outboxRepo.save(outbox);

      const fullMessage = await messageRepo.findOne({
        where: { id: savedMessage.id },
        relations: ['attachments', 'user'],
      });

      return fullMessage || savedMessage;
    });
  }

  /**
   * Soft-deletes a ticket (Admin only).
   */
  async softDelete(
    id: string,
    adminUser: JwtUser,
  ): Promise<{ id: string; deletedAt: Date; deletedBy: string }> {
    if (adminUser.role !== 'admin') {
      throw new ForbiddenException('Only administrators can delete tickets.');
    }

    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID '${id}' not found.`);
    }

    const now = new Date();
    await this.ticketRepository.update(id, {
      deletedAt: now,
      deletedBy: adminUser.id,
    });

    // Log audit ledger event
    await this.eventsService.logEvent(id, adminUser.id, 'TICKET_DELETED', null, {
      deletedAt: now,
      deletedBy: adminUser.id,
    });

    // Outbox event
    const outbox = this.outboxRepository.create({
      aggregateType: 'TICKET',
      aggregateId: id,
      eventType: 'ticket.deleted',
      payload: {
        ticketId: id,
        deletedBy: adminUser.id,
        deletedAt: now,
      },
    });
    await this.outboxRepository.save(outbox);

    return {
      id,
      deletedAt: now,
      deletedBy: adminUser.id,
    };
  }

  /**
   * Internal helper: finds ticket by ID.
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
