import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Book } from '../books/book.entity';
import { ReservationStatus } from './enums/reservation-status.enum';

/** Member queued for a title when every copy is on loan. */
@Entity({ name: 'reservation' })
@Index('uq_reservation_active_user_book', ['userId', 'bookId'], {
  unique: true,
  where: `"status" = 'active'`,
})
@Index('idx_reservation_active_queue', ['bookId', 'createdAt'], {
  where: `"status" = 'active'`,
})
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Gateway user UUID (member) — no DB FK. */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'book_id', type: 'uuid' })
  bookId!: string;

  @ManyToOne(() => Book, (book) => book.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ type: 'varchar', length: 20, default: ReservationStatus.Active })
  status!: ReservationStatus;

  /** Optional cache; queue order is primarily by created_at. */
  @Column({ name: 'queue_position', type: 'int', nullable: true })
  queuePosition!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'fulfilled_at', type: 'timestamptz', nullable: true })
  fulfilledAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;
}
