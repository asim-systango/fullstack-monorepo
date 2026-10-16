import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Rsvp } from '../../rsvps/entities/rsvp.entity';
import { CheckIn } from '../../checkins/entities/check-in.entity';

export enum TicketStatus {
  ISSUED = 'ISSUED',
  USED = 'USED',
  CANCELLED = 'CANCELLED',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', unique: true })
  rsvpId!: string;

  @Index()
  @Column({ type: 'uuid' })
  eventId!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  qrPayload!: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.ISSUED,
  })
  status!: TicketStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @OneToOne(() => Rsvp, (rsvp) => rsvp.ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rsvpId' })
  rsvp!: Rsvp;

  @ManyToOne(() => Event, (event) => event.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @OneToMany(() => CheckIn, (checkIn) => checkIn.ticket)
  checkIns?: CheckIn[];
}
