import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rsvp } from './entities/rsvp.entity';
import { Event } from '../events/entities/event.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { WaitlistEntry } from '../waitlist/entities/waitlist-entry.entity';
import { RsvpsService } from './rsvps.service';
import { RsvpsController } from './rsvps.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rsvp, Event, Ticket, WaitlistEntry]),
  ],
  controllers: [RsvpsController],
  providers: [RsvpsService],
  exports: [RsvpsService],
})
export class RsvpsModule {}
