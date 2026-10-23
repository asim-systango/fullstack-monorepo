import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { Organization } from './organization.entity';
import { Contact } from './contact.entity';
import { Lead } from './lead.entity';
import { User } from './user.entity';

export enum DealStage {
  OPEN = 'OPEN',
  DEMO = 'DEMO',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

@Entity({ name: 'deals' })
export class Deal {
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

  @Column({ type: 'char', length: 26, unique: true })
  @Index()
  leadId!: string;

  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead?: Lead;

  @Column({ type: 'char', length: 26 })
  @Index()
  contactId!: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contactId' })
  contact?: Contact;

  @Column({ type: 'char', length: 26 })
  @Index()
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ownerId' })
  owner?: User;

  @Column({ length: 255 })
  @Index()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: DealStage,
    default: DealStage.OPEN,
  })
  @Index()
  stage!: DealStage;

  @Column({ type: 'smallint', default: 0 })
  probability!: number;

  @Column({ type: 'date', nullable: true })
  @Index()
  expectedCloseDate?: string;

  @Column({ type: 'bigint', nullable: true })
  wonAt?: number;

  @Column({ type: 'bigint', nullable: true })
  lostAt?: number;

  @Column({ type: 'text', nullable: true })
  lostReason?: string;

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
