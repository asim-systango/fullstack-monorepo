import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { TicketEvent } from './ticket-event.entity';
import { Message } from './message.entity';
import { TicketTag } from './ticket-tag.entity';
import { SlaPriority } from '../categories/sla-policy.entity';

export enum TicketStatus {
  OPEN = 'open',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'bigint',
    name: 'ticket_number',
    generated: 'identity',
    readonly: true,
  })
  ticketNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status!: TicketStatus;

  @Column({
    type: 'enum',
    enum: SlaPriority,
    default: SlaPriority.MEDIUM,
  })
  priority!: SlaPriority;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'assignee_id', nullable: true })
  assigneeId!: string | null;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ type: 'timestamptz', name: 'first_response_due_at', nullable: true })
  firstResponseDueAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'first_response_at', nullable: true })
  firstResponseAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'resolution_due_at', nullable: true })
  resolutionDueAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'resolved_at', nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'closed_at', nullable: true })
  closedAt!: Date | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ type: 'tsvector', name: 'search_vector', select: false, nullable: true })
  searchVector!: string | null;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'uuid', name: 'deleted_by', nullable: true })
  deletedBy!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.tickets, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToMany(() => TicketEvent, (event) => event.ticket)
  events!: TicketEvent[];

  @OneToMany(() => Message, (message) => message.ticket)
  messages!: Message[];

  @OneToMany(() => TicketTag, (ticketTag) => ticketTag.ticket)
  ticketTags!: TicketTag[];
}
