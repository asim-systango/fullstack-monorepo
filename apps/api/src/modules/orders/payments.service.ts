import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import type { JwtUser } from '../../common/auth';
import { toPaise } from '../../common/pricing';
import { razorpayConfig } from '../../config/razorpay.config';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Order, OrderPaymentStatus } from './order.entity';
import { Payment, PaymentStatus } from './payment.entity';
import { createRazorpayOrder, RazorpayApiError } from './razorpay.client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async getPaymentForOrder(orderId: string, user: JwtUser) {
    const order = await this.getOrderOrFail(orderId);
    await this.assertCanPay(order, user);

    const payment = await this.paymentRepo.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    return this.toResponse(payment, order);
  }

  /** Creates or returns a Razorpay checkout payload (real keys) or mock test checkout. */
  async createCheckout(orderId: string, user: JwtUser) {
    const order = await this.getOrderOrFail(orderId);
    await this.assertCanPay(order, user);

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const amount = toPaise(Number(order.total));
    const { enabled, keyId } = razorpayConfig();

    if (enabled && amount < 100) {
      throw new BadRequestException('Order total must be at least ₹1 for Razorpay checkout');
    }

    let payment = await this.paymentRepo.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });

    const needsRealOrder =
      enabled &&
      (!payment ||
        !payment.providerOrderId ||
        payment.providerOrderId.startsWith('order_mock_'));

    if (needsRealOrder) {
      let rzpOrder: { id: string; amount: number; currency: string };
      try {
        rzpOrder = await createRazorpayOrder({
          amount,
          currency: 'INR',
          receipt: order.id.replace(/-/g, '').slice(0, 40),
          notes: { orderId: order.id, userId: order.userId },
        });
      } catch (err) {
        const message =
          err instanceof RazorpayApiError
            ? err.message
            : 'Could not create Razorpay order';
        throw new InternalServerErrorException(message);
      }

      if (payment) {
        payment.providerOrderId = rzpOrder.id;
        payment.amount = rzpOrder.amount;
        payment.currency = rzpOrder.currency;
        payment.status = PaymentStatus.CREATED;
        payment.providerPaymentId = null;
        payment.providerSignature = null;
        payment.failureReason = null;
        payment.paidAt = null;
        payment = await this.paymentRepo.save(payment);
      } else {
        payment = await this.paymentRepo.save(
          this.paymentRepo.create({
            orderId: order.id,
            provider: 'razorpay',
            providerOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            status: PaymentStatus.CREATED,
          }),
        );
      }
    } else if (!payment) {
      payment = await this.paymentRepo.save(
        this.paymentRepo.create({
          orderId: order.id,
          provider: 'razorpay',
          providerOrderId: `order_mock_${order.id.replace(/-/g, '').slice(0, 14)}`,
          amount,
          currency: 'INR',
          status: PaymentStatus.CREATED,
        }),
      );
    }

    const mock = !enabled;

    return {
      mock,
      keyId: mock ? 'rzp_test_mock_key' : keyId,
      /** Razorpay unit: paise (₹290.06 → 29006). */
      amount: payment.amount,
      amountInr: Number(order.total),
      currency: payment.currency,
      orderId: order.id,
      razorpayOrderId: payment.providerOrderId,
      paymentId: payment.id,
      provider: payment.provider,
      status: payment.status,
      ...(mock
        ? { note: 'Mock checkout — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for sandbox.' }
        : {}),
    };
  }

  async verifyPayment(orderId: string, dto: VerifyPaymentDto, user: JwtUser) {
    const order = await this.getOrderOrFail(orderId);
    await this.assertCanPay(order, user);

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      return {
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        message: 'Already paid',
      };
    }

    const payment = await this.paymentRepo.findOne({
      where: { orderId, providerOrderId: dto.razorpayOrderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this Razorpay order id');
    }

    if (!dto.razorpayPaymentId) {
      throw new BadRequestException('razorpayPaymentId is required');
    }

    const { enabled, keySecret } = razorpayConfig();
    const isMockPayment =
      !payment.providerOrderId || payment.providerOrderId.startsWith('order_mock_');

    if (enabled && !isMockPayment) {
      if (!dto.razorpaySignature) {
        throw new BadRequestException('razorpaySignature is required');
      }
      if (
        !this.verifyRazorpaySignature(
          dto.razorpayOrderId,
          dto.razorpayPaymentId,
          dto.razorpaySignature,
          keySecret,
        )
      ) {
        throw new BadRequestException('Invalid payment signature');
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(Payment);
      const orderRepo = manager.getRepository(Order);

      payment.providerPaymentId = dto.razorpayPaymentId;
      payment.providerSignature = dto.razorpaySignature ?? 'mock_signature';
      payment.status = PaymentStatus.CAPTURED;
      payment.paidAt = new Date();
      payment.failureReason = null;
      await paymentRepo.save(payment);

      order.paymentStatus = OrderPaymentStatus.PAID;
      await orderRepo.save(order);
    });

    return {
      orderId: order.id,
      paymentStatus: OrderPaymentStatus.PAID,
      razorpayPaymentId: dto.razorpayPaymentId,
      message: isMockPayment ? 'Payment captured (mock Razorpay)' : 'Payment captured',
    };
  }

  private verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string,
  ) {
    const expected = createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  private async getOrderOrFail(orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  private async assertCanPay(order: Order, user: JwtUser) {
    if (user.role === 'admin') return;
    if (user.role === 'user' && order.userId === user.id) return;
    throw new ForbiddenException('Only the customer can pay for this order');
  }

  private toResponse(payment: Payment, order: Order) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
      /** Stored in paise for Razorpay (₹1 = 100). */
      amount: payment.amount,
      amountInr: Number((payment.amount / 100).toFixed(2)),
      currency: payment.currency,
      status: payment.status,
      paidAt: payment.paidAt,
      orderPaymentStatus: order.paymentStatus,
      orderTotal: order.total,
    };
  }
}
