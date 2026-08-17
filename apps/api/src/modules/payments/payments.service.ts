import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentIntent } from './payment-intent.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentIntent)
    private readonly paymentIntents: Repository<PaymentIntent>,
  ) {}

  async findByBooking(bookingId: string) {
    const pi = await this.paymentIntents.findOne({
      where: { bookingId },
    });
    if (!pi) throw new NotFoundException('Payment not found for this booking');
    return pi;
  }
}
