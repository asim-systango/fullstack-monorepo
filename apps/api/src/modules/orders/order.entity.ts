import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalToNumber } from '../../common/decimal.transformer';
import { Restaurant } from '../restaurants/restaurant.entity';
import { DeliveryStatus } from './delivery-status.entity';
import { OrderLine } from './order-line.entity';
import { Payment } from './payment.entity';

export enum OrderStatus {
  PLACED = 'placed',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity({ name: 'orders' })
@Check(
  'CHK_orders_amounts',
  '"subtotal" >= 0 AND "delivery_fee" >= 0 AND "platform_fee" >= 0 AND "tax_amount" >= 0 AND "total" >= 0',
)
@Check('CHK_orders_estimated_minutes', '"estimated_minutes" IS NULL OR "estimated_minutes" > 0')
@Check(
  'CHK_orders_status',
  `"status" IN ('placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')`,
)
@Check(
  'CHK_orders_payment_status',
  `"payment_status" IN ('pending', 'paid', 'failed', 'refunded')`,
)
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_orders_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index('IDX_orders_restaurant_id')
  @Column({ name: 'restaurant_id', type: 'uuid' })
  restaurantId: string;

  @ManyToOne(() => Restaurant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  // This snapshot keeps old receipts correct if the restaurant is renamed.
  @Column({ name: 'restaurant_name', length: 120 })
  restaurantName: string;

  @Index('IDX_orders_status')
  @Column({ type: 'varchar', length: 30, default: OrderStatus.PLACED })
  status: OrderStatus;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Index('IDX_orders_payment_status')
  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 20,
    default: OrderPaymentStatus.PENDING,
  })
  paymentStatus: OrderPaymentStatus;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalToNumber,
  })
  subtotal: number;

  @Column({
    name: 'delivery_fee',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalToNumber,
  })
  deliveryFee: number;

  @Column({
    name: 'platform_fee',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalToNumber,
  })
  platformFee: number;

  @Column({
    name: 'tax_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalToNumber,
  })
  taxAmount: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: decimalToNumber,
  })
  total: number;

  @Column({ length: 3, default: 'INR' })
  currency: string;

  @Column({ name: 'estimated_minutes', type: 'integer', nullable: true })
  estimatedMinutes: number | null;

  @OneToMany(() => OrderLine, (line) => line.order)
  lines: OrderLine[];

  @OneToMany(() => DeliveryStatus, (deliveryStatus) => deliveryStatus.order)
  deliveryStatuses: DeliveryStatus[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
