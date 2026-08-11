import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CreateReservationDto } from './dto/create-reservation.dto';
import type { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { Reservation } from './reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
  ) {}

  // Scaffold — create/cancel + promote-on-return next.
  list(
    _query: ListReservationsQueryDto,
  ): Promise<{ items: Reservation[]; total: number }> {
    return Promise.resolve({ items: [], total: 0 });
  }

  create(_userId: string, _dto: CreateReservationDto): Promise<Reservation> {
    throw new Error('Not implemented');
  }

  cancel(_id: string, _userId: string): Promise<Reservation> {
    throw new Error('Not implemented');
  }
}
