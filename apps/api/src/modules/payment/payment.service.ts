import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Stripe from 'stripe';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Slot } from '../slot/entities/slot.entity';
import { SlotStatus } from '../../shared/enums/slot-status.enum';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe | null = null;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2026-07-29.dahlia',
      });
      this.logger.log('Stripe service initialized');
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not set');
    }
  }

  async createCheckoutSession(patientId: string, slotId: string, origin: string) {
    const slot = await this.dataSource.getRepository(Slot).findOne({
      where: { id: slotId },
      relations: ['doctor', 'doctor.user'],
    });

    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new Error(`Slot ${slotId} is not available for booking`);
    }

    const doctorName =
      slot.doctor?.firstName && slot.doctor?.lastName
        ? `Dr. ${slot.doctor.firstName} ${slot.doctor.lastName}`
        : 'PulseCare Doctor';
    const consultationFee = slot.doctor?.consultationFee
      ? Math.round(Number(slot.doctor.consultationFee) * 100)
      : 5000; // Default $50.00 in cents

    if (!this.stripe) {
      // Mock session fallback if Stripe secret key is absent or testing locally
      const mockSessionId = `cs_test_mock_${Date.now()}`;
      return {
        url: `${origin}/appointments?session_id=${mockSessionId}&slotId=${slotId}&mock=true`,
        sessionId: mockSessionId,
      };
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Medical Consultation - ${doctorName}`,
                description: `Slot on ${new Date(slot.startsAt).toLocaleString()}`,
              },
              unit_amount: consultationFee,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/appointments?session_id={CHECKOUT_SESSION_ID}&slot_id=${slotId}&status=success`,
        cancel_url: `${origin}/appointments?status=cancelled`,
        metadata: {
          patientId,
          slotId,
        },
      });

      return { url: session.url, sessionId: session.id };
    } catch (err) {
      this.logger.error(
        `Failed to create Stripe checkout session: ${(err as Error).message}`,
      );
      throw new InternalServerErrorException('Could not create Stripe checkout session');
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    if (!this.stripe) return { received: false };

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (webhookSecret && signature) {
        event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } else {
        event = JSON.parse(payload.toString());
      }
    } catch (err) {
      this.logger.error(`Stripe Webhook Signature Error: ${(err as Error).message}`);
      throw new Error(`Webhook Error: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const patientId = session.metadata?.patientId;
      const slotId = session.metadata?.slotId;

      if (patientId && slotId) {
        await this.confirmBookingAfterPayment(patientId, slotId);
      }
    }

    return { received: true };
  }

  private async confirmBookingAfterPayment(patientId: string, slotId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slot = await queryRunner.manager.findOne(Slot, {
        where: { id: slotId },
        lock: { mode: 'pessimistic_write' },
      });

      if (slot && slot.status === SlotStatus.AVAILABLE) {
        slot.status = SlotStatus.BOOKED;
        await queryRunner.manager.save(Slot, slot);

        const appointment = queryRunner.manager.create(Appointment, {
          patientId,
          slotId,
          status: AppointmentStatus.SCHEDULED,
          reason: 'Paid Consultation Slot',
        });
        await queryRunner.manager.save(Appointment, appointment);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed confirming payment booking for slot ${slotId}: ${(err as Error).message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
