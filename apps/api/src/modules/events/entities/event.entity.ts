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

  @Column({ type: 'timestamp with time zone', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
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

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @OneToMany(() => Rsvp, (rsvp) => rsvp.event)
  rsvps?: Rsvp[];

  @OneToMany(() => Ticket, (ticket) => ticket.event)
  tickets?: Ticket[];

  @OneToMany(() => WaitlistEntry, (waitlist) => waitlist.event)
  waitlistEntries?: WaitlistEntry[];
}
