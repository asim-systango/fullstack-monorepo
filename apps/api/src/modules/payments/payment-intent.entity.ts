import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from '../bookings/booking.entity';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

@Entity({ name: 'payment_intents' })
export class PaymentIntent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  bookingId!: string;

  @OneToOne(() => Booking, (booking) => booking.paymentIntent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  /** Amount in cents */
  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 50, default: 'mock' })
  provider!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
