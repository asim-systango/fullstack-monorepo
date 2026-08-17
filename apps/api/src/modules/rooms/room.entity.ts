import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Hotel } from '../hotels/hotel.entity';
import { Booking } from '../bookings/booking.entity';

export type RoomType = 'single' | 'double' | 'suite';

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'hotel_id', type: 'uuid' })
  hotelId!: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel!: Hotel;

  @Column()
  name!: string;

  @Column({ type: 'varchar', length: 20, default: 'double' })
  type!: RoomType;

  /** Price per night stored in cents to avoid floating-point issues */
  @Column({ name: 'price_per_night', type: 'int' })
  pricePerNight!: number;

  @Column({ type: 'int', default: 2 })
  capacity!: number;

  @Column({ type: 'text', default: '' })
  amenities!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings!: Booking[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
