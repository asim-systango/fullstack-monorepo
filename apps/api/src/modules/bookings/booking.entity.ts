import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from '../rooms/room.entity';
import { PaymentIntent } from '../payments/payment-intent.entity';

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'room_id', type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room, (room) => room.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  /** FK to gateway User — never import User entity */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'check_in', type: 'date' })
  checkIn!: string;

  @Column({ name: 'check_out', type: 'date' })
  checkOut!: string;

  @Column({ type: 'varchar', length: 20, default: 'confirmed' })
  status!: BookingStatus;

  /** Total price in cents */
  @Column({ name: 'total_price', type: 'int' })
  totalPrice!: number;

  @OneToOne(() => PaymentIntent, (pi) => pi.booking)
  paymentIntent!: PaymentIntent;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
