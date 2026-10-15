import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/auth';
import type { JwtUser } from '../../common/auth';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('bookings/:bookingId/payment')
  findByBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.paymentsService.findByBooking(bookingId, user.id, user.role);
  }
}
