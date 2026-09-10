import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Rsvp } from '../rsvps/entities/rsvp.entity';
import { WaitlistEntry } from '../waitlist/entities/waitlist-entry.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Rsvp, WaitlistEntry, Ticket]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
