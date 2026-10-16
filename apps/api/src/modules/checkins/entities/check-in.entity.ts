import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('check_ins')
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  ticketId!: string;

  @Index()
  @Column({ type: 'uuid' })
  scannedByUserId!: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  scannedAt!: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.checkIns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket!: Ticket;
}
