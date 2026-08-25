import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { TicketEvent } from './ticket-event.entity';

@Injectable()
export class TicketEventsService {
  constructor(
    @InjectRepository(TicketEvent)
    private readonly eventRepository: Repository<TicketEvent>,
  ) {}

  /**
   * Records an audit ledger entry into `ticket_events`. Supports optional transactional manager.
   */
  async logEvent(
    ticketId: string,
    actorId: string,
    eventType: string,
    oldValue?: Record<string, unknown> | null,
    newValue?: Record<string, unknown> | null,
    reason?: string | null,
    manager?: EntityManager,
  ): Promise<TicketEvent> {
    const repo = manager ? manager.getRepository(TicketEvent) : this.eventRepository;
    const event = repo.create({
      ticketId,
      actorId,
      eventType,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      reason: reason ?? null,
    });

    return repo.save(event);
  }

  /**
   * Retrieves chronological audit history for a given ticket.
   */
  async getEventsByTicketId(ticketId: string): Promise<TicketEvent[]> {
    return this.eventRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }
}
