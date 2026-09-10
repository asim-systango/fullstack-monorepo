import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Rsvp, RsvpStatus } from './entities/rsvp.entity';
import { Event, EventStatus } from '../events/entities/event.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { WaitlistEntry, WaitlistStatus } from '../waitlist/entities/waitlist-entry.entity';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Rsvp)
    private readonly rsvpsRepository: Repository<Rsvp>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(WaitlistEntry)
    private readonly waitlistRepository: Repository<WaitlistEntry>,
  ) {}

  /**
   * Handle RSVP creation/update with transactional capacity check and waitlist handling.
   */
  async handleRsvp(eventId: string, userId: string, dto: CreateRsvpDto) {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event || event.deletedAt) {
      throw new NotFoundException(`Event with ID "${eventId}" is not available.`);
    }

    if (event.status === EventStatus.DRAFT) {
      throw new BadRequestException('Cannot RSVP to a draft event. This event is not yet published to the public.');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot RSVP to a cancelled event.');
    }

    if (event.endDate && new Date(event.endDate) < new Date()) {
      throw new BadRequestException('Cannot RSVP to a completed event.');
    }

    const targetStatus = dto.status;

    // Use a transaction for atomic capacity enforcement and waitlist promotion
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lock the event row for update (to prevent race conditions on capacity)
      const lockedEvent = await queryRunner.manager.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedEvent) {
        throw new NotFoundException(`Event not found.`);
      }

      // Check existing RSVP
      let existingRsvp = await queryRunner.manager.findOne(Rsvp, {
        where: { eventId, userId },
      });

      // Calculate current occupied spots from confirmed YES RSVPs (excluding current user's RSVP)
      const occupiedResult = await queryRunner.manager
        .createQueryBuilder(Rsvp, 'r')
        .select('COALESCE(SUM(1 + r.guestCount), 0)', 'occupiedSpots')
        .where('r.eventId = :eventId AND r.status = :status AND r.userId != :userId', {
          eventId,
          status: RsvpStatus.YES,
          userId,
        })
        .getRawOne();
      const occupiedSpots = parseInt(occupiedResult?.occupiedSpots ?? occupiedResult?.occupiedspots ?? '0', 10);

      const requestedGuestCount = Math.min(5, Math.max(0, dto.guestCount || 0));
      const requestedSpots = 1 + requestedGuestCount;

      // Handle target status: YES
      if (targetStatus === RsvpStatus.YES) {
        // Check capacity against total requested spots (user + guests)
        if (occupiedSpots + requestedSpots > lockedEvent.capacity) {
          // Event is FULL -> Create or update Waitlist entry
          let waitlistEntry = await queryRunner.manager.findOne(WaitlistEntry, {
            where: { eventId, userId },
          });

          const currentWaitlistCount = await queryRunner.manager.count(WaitlistEntry, {
            where: { eventId, status: WaitlistStatus.WAITING },
          });

          if (!waitlistEntry) {
            waitlistEntry = queryRunner.manager.create(WaitlistEntry, {
              eventId,
              userId,
              position: currentWaitlistCount + 1,
              status: WaitlistStatus.WAITING,
            });
            await queryRunner.manager.save(WaitlistEntry, waitlistEntry);
          } else if (waitlistEntry.status !== WaitlistStatus.WAITING) {
            waitlistEntry.status = WaitlistStatus.WAITING;
            waitlistEntry.position = currentWaitlistCount + 1;
            waitlistEntry.createdAt = new Date();
            await queryRunner.manager.save(WaitlistEntry, waitlistEntry);
          }

          // Also store desired guest count on RSVP if present
          if (!existingRsvp) {
            existingRsvp = queryRunner.manager.create(Rsvp, {
              eventId,
              userId,
              status: RsvpStatus.NO,
              guestCount: requestedGuestCount,
            });
          } else {
            existingRsvp.guestCount = requestedGuestCount;
          }
          await queryRunner.manager.save(Rsvp, existingRsvp);

          // Calculate exact real-time queue position
          const aheadCount = await queryRunner.manager.count(WaitlistEntry, {
            where: {
              eventId,
              status: WaitlistStatus.WAITING,
              createdAt: LessThan(waitlistEntry.createdAt),
            },
          });
          const realTimePosition = aheadCount + 1;

          await queryRunner.commitTransaction();
          return {
            status: 'WAITLISTED',
            message: `Event capacity is full (${occupiedSpots}/${lockedEvent.capacity} spots taken). You have been added to the waitlist at position #${realTimePosition}.`,
            waitlistPosition: realTimePosition,
          };
        }

        // Space is AVAILABLE -> Create/Update RSVP to YES
        if (!existingRsvp) {
          existingRsvp = queryRunner.manager.create(Rsvp, {
            eventId,
            userId,
            status: RsvpStatus.YES,
            guestCount: requestedGuestCount,
          });
        } else {
          existingRsvp.status = RsvpStatus.YES;
          existingRsvp.guestCount = requestedGuestCount;
        }
        await queryRunner.manager.save(Rsvp, existingRsvp);

        // Issue Ticket if not exists or if cancelled
        let ticket = await queryRunner.manager.findOne(Ticket, {
          where: { rsvpId: existingRsvp.id },
        });

        if (!ticket) {
          const qrPayload = `TKT-${eventId.slice(0, 8)}-${userId.slice(0, 8)}-${Date.now()}`;
          ticket = queryRunner.manager.create(Ticket, {
            rsvpId: existingRsvp.id,
            eventId,
            userId,
            qrPayload,
            status: TicketStatus.ISSUED,
          });
          await queryRunner.manager.save(Ticket, ticket);
        } else if (ticket.status === TicketStatus.CANCELLED) {
          ticket.status = TicketStatus.ISSUED;
          await queryRunner.manager.save(Ticket, ticket);
        }

        // If user was on waitlist, update waitlist status to PROMOTED
        const userWaitlist = await queryRunner.manager.findOne(WaitlistEntry, {
          where: { eventId, userId, status: WaitlistStatus.WAITING },
        });
        if (userWaitlist) {
          userWaitlist.status = WaitlistStatus.PROMOTED;
          await queryRunner.manager.save(WaitlistEntry, userWaitlist);
        }

        await queryRunner.commitTransaction();
        return {
          status: 'SUCCESS',
          message: requestedGuestCount > 0
            ? `RSVP confirmed for 1 + ${requestedGuestCount} guest(s)! Ticket pass issued.`
            : 'RSVP confirmed! Ticket issued.',
          rsvp: existingRsvp,
          ticket,
        };
      }

      // Handle target status: NO or MAYBE (Cancellation / Relinquishing spot / Leaving waitlist)
      const previousWasYes = existingRsvp && existingRsvp.status === RsvpStatus.YES;

      if (!existingRsvp) {
        existingRsvp = queryRunner.manager.create(Rsvp, {
          eventId,
          userId,
          status: targetStatus,
          guestCount: 0,
        });
      } else {
        existingRsvp.status = targetStatus;
        existingRsvp.guestCount = 0;
      }
      await queryRunner.manager.save(Rsvp, existingRsvp);

      // Cancel associated ticket if present
      const userTicket = await queryRunner.manager.findOne(Ticket, {
        where: { rsvpId: existingRsvp.id },
      });
      if (userTicket && userTicket.status !== TicketStatus.USED) {
        userTicket.status = TicketStatus.CANCELLED;
        await queryRunner.manager.save(Ticket, userTicket);
      }

      // If user was on waitlist, cancel their waitlist entry
      const activeWaitlist = await queryRunner.manager.findOne(WaitlistEntry, {
        where: { eventId, userId, status: WaitlistStatus.WAITING },
      });
      let wasOnWaitlist = false;
      if (activeWaitlist) {
        activeWaitlist.status = WaitlistStatus.CANCELLED;
        await queryRunner.manager.save(WaitlistEntry, activeWaitlist);
        wasOnWaitlist = true;
      }

      // If user was previously YES, we now promote waitlist entries if space opens up
      let promotedInfo = null;
      if (previousWasYes) {
        const oldestWaitlist = await queryRunner.manager.findOne(WaitlistEntry, {
          where: { eventId, status: WaitlistStatus.WAITING },
          order: { createdAt: 'ASC' },
        });

        if (oldestWaitlist) {
          // Promote waitlisted user
          oldestWaitlist.status = WaitlistStatus.PROMOTED;
          await queryRunner.manager.save(WaitlistEntry, oldestWaitlist);

          // Create/Update RSVP for promoted user
          let promotedRsvp = await queryRunner.manager.findOne(Rsvp, {
            where: { eventId, userId: oldestWaitlist.userId },
          });

          if (!promotedRsvp) {
            promotedRsvp = queryRunner.manager.create(Rsvp, {
              eventId,
              userId: oldestWaitlist.userId,
              status: RsvpStatus.YES,
              guestCount: 0,
            });
          } else {
            promotedRsvp.status = RsvpStatus.YES;
          }
          await queryRunner.manager.save(Rsvp, promotedRsvp);

          // Issue Ticket for promoted user
          const qrPayload = `TKT-${eventId.slice(0, 8)}-${oldestWaitlist.userId.slice(0, 8)}-${Date.now()}`;
          const promotedTicket = queryRunner.manager.create(Ticket, {
            rsvpId: promotedRsvp.id,
            eventId,
            userId: oldestWaitlist.userId,
            qrPayload,
            status: TicketStatus.ISSUED,
          });
          await queryRunner.manager.save(Ticket, promotedTicket);

          promotedInfo = {
            promotedUserId: oldestWaitlist.userId,
            promotedTicketId: promotedTicket.id,
          };
        }
      }

      await queryRunner.commitTransaction();
      return {
        status: 'SUCCESS',
        message: wasOnWaitlist
          ? `RSVP updated to ${targetStatus}. You have been removed from the waitlist.`
          : `RSVP updated to ${targetStatus}.`,
        rsvp: existingRsvp,
        promotedWaitlistUser: promotedInfo,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyRsvpForEvent(eventId: string, userId: string) {
    const rsvp = await this.rsvpsRepository.findOne({
      where: { eventId, userId },
      relations: ['ticket'],
    });

    const waitlist = await this.waitlistRepository.findOne({
      where: { eventId, userId, status: WaitlistStatus.WAITING },
    });

    if (waitlist) {
      const aheadCount = await this.waitlistRepository.count({
        where: {
          eventId,
          status: WaitlistStatus.WAITING,
          createdAt: LessThan(waitlist.createdAt),
        },
      });
      waitlist.position = aheadCount + 1;
    }

    return {
      rsvp: rsvp || null,
      waitlist: waitlist || null,
    };
  }

  async getMyRsvps(userId: string) {
    return this.rsvpsRepository.find({
      where: { userId },
      relations: ['event', 'ticket'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyWaitlistEntries(userId: string) {
    const entries = await this.waitlistRepository.find({
      where: { userId, status: WaitlistStatus.WAITING },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      entries.map(async (entry) => {
        const aheadCount = await this.waitlistRepository.count({
          where: {
            eventId: entry.eventId,
            status: WaitlistStatus.WAITING,
            createdAt: LessThan(entry.createdAt),
          },
        });
        return {
          ...entry,
          position: aheadCount + 1,
        };
      }),
    );
  }
}