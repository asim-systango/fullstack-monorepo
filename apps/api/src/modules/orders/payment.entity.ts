import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum PaymentStatus {
  CREATED = 'created',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'payments' })
@Check('CHK_payments_amount', '"amount" > 0')
@Check(
  'CHK_payments_status',
  `"status" IN ('created', 'authorized', 'captured', 'failed', 'refunded')`,
)
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_payments_order_id')
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ length: 20, default: 'razorpay' })
  provider: string;

  @Index('UQ_payments_provider_order_id', { unique: true })
  @Column({ name: 'provider_order_id', type: 'varchar', nullable: true })
  providerOrderId: string | null;

  @Index('UQ_payments_provider_payment_id', { unique: true })
  @Column({ name: 'provider_payment_id', type: 'varchar', nullable: true })
  providerPaymentId: string | null;

  @Column({ name: 'provider_signature', type: 'text', nullable: true })
  providerSignature: string | null;

  // Razorpay expects the amount in paise, so this is an integer.
  @Column({ type: 'integer' })
  amount: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Index('IDX_payments_status')
  @Column({ type: 'varchar', length: 20, default: PaymentStatus.CREATED })
  status: PaymentStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
