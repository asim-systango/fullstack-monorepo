import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles, type JwtUser } from '../../common/auth';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@Roles('user', 'admin')
@Controller('orders/:orderId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get payment details for an order' })
  getPayment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.paymentsService.getPaymentForOrder(orderId, user);
  }

  @Post('create')
  @ApiOperation({
    summary: 'Create mock Razorpay checkout payload',
    description:
      'Returns keyId + razorpayOrderId + amount in paise (Razorpay) and amountInr for display.',
  })
  createCheckout(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.paymentsService.createCheckout(orderId, user);
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify mock Razorpay payment and mark order as paid',
  })
  verify(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: VerifyPaymentDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.paymentsService.verifyPayment(orderId, dto, user);
  }
}
