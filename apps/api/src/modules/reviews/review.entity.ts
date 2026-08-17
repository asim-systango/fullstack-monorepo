import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Hotel } from '../hotels/hotel.entity';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'hotel_id', type: 'uuid' })
  hotelId!: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  /** FK to gateway User — never import User entity */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  /** Optional link to the completed booking that this review is for */
  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId!: string | null;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', default: '' })
  comment!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
