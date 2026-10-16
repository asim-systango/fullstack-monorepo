import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Rsvp } from '../../rsvps/entities/rsvp.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { WaitlistEntry } from '../../waitlist/entities/waitlist-entry.entity';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

const TIMESTAMP_TZ = 'timestamp with time zone' as const;

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string | null;

  @Column({ type: TIMESTAMP_TZ, nullable: true })
  startDate?: Date | null;

  @Column({ type: TIMESTAMP_TZ, nullable: true })
  endDate?: Date | null;

  @Column({ type: 'int', default: 50 })
  capacity!: number;

  @Index()
  @Column({ type: 'uuid' })
  organizerId!: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PUBLISHED,
  })
  status!: EventStatus;

  @Index()
  @Column({ type: 'varchar', length: 100, default: 'General' })
  category!: string;

  @DeleteDateColumn({ type: TIMESTAMP_TZ, nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ type: TIMESTAMP_TZ })
  createdAt!: Date;

  @UpdateDateColumn({ type: TIMESTAMP_TZ })
  updatedAt!: Date;

  @OneToMany(() => Rsvp, (rsvp) => rsvp.event)
  rsvps?: Rsvp[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets?: Ticket[];

  @OneToMany(() => WaitlistEntry, (waitlist) => waitlist.event)
  waitlistEntries?: WaitlistEntry[];
}
