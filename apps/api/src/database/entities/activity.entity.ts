import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { ulid } from 'ulid';
import { Organization } from './organization.entity';
import { Lead } from './lead.entity';
import { Deal } from './deal.entity';
import { User } from './user.entity';

export enum ActivityType {
  NOTE = 'NOTE',
  TASK = 'TASK',
  CALL = 'CALL',
  MEETING = 'MEETING',
  EMAIL = 'EMAIL',
  FOLLOW_UP = 'FOLLOW_UP',
}

@Entity({ name: 'activities' })
@Check(`"leadId" IS NOT NULL OR "dealId" IS NOT NULL`)
export class Activity {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ type: 'char', length: 26 })
  @Index()
  organizationId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  leadId?: string;

  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead?: Lead;

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  dealId?: string;

  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dealId' })
  deal?: Deal;

  @Column({ length: 50 })
  @Index()
  stage!: string;

  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.NOTE,
  })
  @Index()
  activityType!: ActivityType;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  dueAt?: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  completedAt?: number;

  @Column({ type: 'char', length: 26 })
  @Index()
  createdBy!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  creator?: User;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  @Index()
  createdAt!: number;

  @Column({
    type: 'bigint',
    default: () => 'EXTRACT(EPOCH FROM NOW()) * 1000',
  })
  updatedAt!: number;
}
