import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CheckIn } from '../checkins/entities/check-in.entity';
import { CheckInDto } from './dto/check-in.dto';
import { EventStatus } from '../events/entities/event.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(CheckIn)
    private readonly checkInsRepository: Repository<CheckIn>,
  ) {}

  async getMyTickets(userId: string) {
    return this.ticketsRepository.find({
      where: { userId },
      relations: ['event', 'checkIns', 'rsvp'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTicketById(id: string, userId: string, role: string) {
    const ticket = await this.ticketsRepository.findOne({
      where: { id },
      relations: ['event', 'rsvp', 'checkIns'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found.`);
    }

    if (role !== 'admin' && role !== 'staff' && ticket.userId !== userId) {
      throw new ForbiddenException('You are not authorized to view this ticket.');
    }

    return ticket;
  }

  async checkInTicket(dto: CheckInDto, staffUserId: string) {
    const { qrPayload } = dto;

    const ticket = await this.ticketsRepository.findOne({
      where: { qrPayload },
      relations: ['event', 'checkIns'],
    });

    if (!ticket) {
      throw new NotFoundException(`Invalid ticket. No ticket found matching QR payload.`);
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException(
        'This ticket has been cancelled and cannot be used for check-in.',
      );
    }

    if (ticket.status === TicketStatus.USED) {
      const existingCheckIn =
        ticket.checkIns && ticket.checkIns.length > 0 ? ticket.checkIns[0] : null;
      throw new BadRequestException({
        message: 'Ticket already used!',
        scannedAt: existingCheckIn ? existingCheckIn.scannedAt : ticket.updatedAt,
        ticketId: ticket.id,
        eventTitle: ticket.event?.title,
      });
    }

    // Validate Event Lifecycle & Check-In Time Window (Start - 1 hour to End Date)
    const event = ticket.event;
    if (event?.status === EventStatus.CANCELLED) {
      throw new BadRequestException(
        'Check-in failed: The event has been cancelled by the organizer.',
      );
    }

    if (event?.status === EventStatus.DRAFT) {
      throw new BadRequestException(
        'Check-in failed: The event is still in draft mode and not published.',
      );
    }

    const now = new Date();
    const startDate = event?.startDate ? new Date(event.startDate) : null;
    let endDate: Date | null = null;
    if (event?.endDate) {
      endDate = new Date(event.endDate);
    } else if (startDate) {
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    }

    if (startDate) {
      // Check-in opens 2 hours before event start time
      const windowStart = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);

      if (now < windowStart) {
        const formattedStart = startDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const formattedOpen = windowStart.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        throw new BadRequestException(
          `Check-in failed: Event check-in window is not open yet. Check-in opens 2 hours prior to event start time (${formattedOpen} on ${formattedStart}).`,
        );
      }
    }

    if (endDate) {
      // Check-in closes 2 hours after event end time (or fallback end time)
      const windowEnd = new Date(endDate.getTime() + 2 * 60 * 60 * 1000);

      if (now > windowEnd) {
        const formattedEnd = endDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        throw new BadRequestException(
          `Check-in failed: Event check-in window closed on ${formattedEnd}.`,
        );
      }
    }

    // Mark as USED and record CheckIn
    ticket.status = TicketStatus.USED;
    await this.ticketsRepository.save(ticket);

    const checkIn = this.checkInsRepository.create({
      ticketId: ticket.id,
      scannedByUserId: staffUserId,
    });
    await this.checkInsRepository.save(checkIn);

    return {
      success: true,
      message: `Check-in successful for ticket ${ticket.id}`,
      ticket: {
        id: ticket.id,
        status: ticket.status,
        qrPayload: ticket.qrPayload,
        userId: ticket.userId,
      },
      event: {
        id: ticket.event?.id,
        title: ticket.event?.title,
        location: ticket.event?.location,
      },
      checkIn: {
        id: checkIn.id,
        scannedAt: checkIn.scannedAt,
        scannedByUserId: staffUserId,
      },
    };
  }
}
