import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('bookings/:bookingId/payment')
  findByBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }
}
