import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketEvent } from './ticket-event.entity';
import { Message } from './message.entity';
import { Attachment } from './attachment.entity';
import { Tag } from './tag.entity';
import { TicketTag } from './ticket-tag.entity';
import { Category } from '../categories/category.entity';
import { SlaPolicy } from '../categories/sla-policy.entity';
import { OutboxEvent } from '../events/outbox-event.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketEventsService } from './ticket-events.service';
import { TicketStatusMachine } from './ticket-status.machine';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      TicketEvent,
      Message,
      Attachment,
      Tag,
      TicketTag,
      Category,
      SlaPolicy,
      OutboxEvent,
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, TicketEventsService, TicketStatusMachine],
  exports: [TypeOrmModule, TicketsService, TicketEventsService, TicketStatusMachine],
})
export class TicketsModule {}
