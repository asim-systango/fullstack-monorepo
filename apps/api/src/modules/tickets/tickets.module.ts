import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketEvent } from './ticket-event.entity';
import { Message } from './message.entity';
import { Attachment } from './attachment.entity';
import { Tag } from './tag.entity';
import { TicketTag } from './ticket-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketEvent, Message, Attachment, Tag, TicketTag]),
  ],
  exports: [TypeOrmModule],
})
export class TicketsModule {}
