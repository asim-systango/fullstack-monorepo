import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentIntent } from './payment-intent.entity';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentIntent)
    private readonly paymentIntents: Repository<PaymentIntent>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
  ) {}

  async findByBooking(bookingId: string, userId: string, role: string) {
    const booking = await this.bookings.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (role !== 'admin' && booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this payment');
    }

    const pi = await this.paymentIntents.findOne({
      where: { bookingId },
    });
    if (!pi) throw new NotFoundException('Payment not found for this booking');
    return pi;
  }
}
