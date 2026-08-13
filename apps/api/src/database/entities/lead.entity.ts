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
import { User } from './user.entity';

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  MANUAL = 'MANUAL',
  IMPORT = 'IMPORT',
  API = 'API',
  REFERRAL = 'REFERRAL',
}

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

@Entity({ name: 'leads' })
export class Lead {
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

  @Column({ type: 'char', length: 26 })
  @Index()
  contactId!: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contactId' })
  contact?: Contact;

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  ownerId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner?: User;

  @Column({ type: 'char', length: 26, nullable: true })
  assignedBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedBy' })
  assigner?: User;

  @Column({ length: 255 })
  @Index()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: LeadSource,
    default: LeadSource.MANUAL,
  })
  @Index()
  source!: LeadSource;

  @Column({
    type: 'enum',
    enum: LeadStage,
    default: LeadStage.NEW,
  })
  @Index()
  stage!: LeadStage;

  @Column({ type: 'bigint', nullable: true })
  qualifiedAt?: number;

  @Column({ type: 'bigint', nullable: true })
  convertedAt?: number;

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
