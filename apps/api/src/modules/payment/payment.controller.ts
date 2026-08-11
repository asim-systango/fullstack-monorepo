import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { CurrentUser, JwtUser, Public } from '../../common/auth';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session for slot booking' })
  async createCheckout(
    @CurrentUser() user: JwtUser | undefined,
    @Body('slotId') slotId: string,
    @Req() req: Request,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required to process payment');
    }
    const origin = `${req.protocol}://${req.get('host')}`;
    return this.paymentService.createCheckoutSession(user.id, slotId, origin);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint for payment event notifications' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    return this.paymentService.handleWebhook(signature, rawBody);
  }
}
