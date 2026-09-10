import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

export enum WaitlistStatus {
  WAITING = 'WAITING',
  PROMOTED = 'PROMOTED',
  CANCELLED = 'CANCELLED',
}

@Entity('waitlist_entries')
@Index(['eventId', 'status'])
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  eventId!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'int', default: 1 })
  position!: number;

  @Column({
    type: 'enum',
    enum: WaitlistStatus,
    default: WaitlistStatus.WAITING,
  })
  status!: WaitlistStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @ManyToOne(() => Event, (event) => event.waitlistEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;
}
