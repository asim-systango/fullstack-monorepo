import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum RsvpStatus {
  YES = 'YES',
  NO = 'NO',
  MAYBE = 'MAYBE',
}

@Entity('rsvps')
@Unique(['eventId', 'userId'])
@Index(['eventId', 'status'])
export class Rsvp {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  eventId!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({
    type: 'enum',
    enum: RsvpStatus,
    default: RsvpStatus.YES,
  })
  status!: RsvpStatus;

  @Column({ type: 'int', default: 0 })
  guestCount!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @ManyToOne(() => Event, (event) => event.rsvps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @OneToOne(() => Ticket, (ticket) => ticket.rsvp)
  ticket?: Ticket;
}
