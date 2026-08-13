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
import { User } from './user.entity';

export enum ContactSource {
  WEBSITE = 'WEBSITE',
  MANUAL = 'MANUAL',
  IMPORT = 'IMPORT',
  API = 'API',
  REFERRAL = 'REFERRAL',
}

export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ name: 'contacts' })
export class Contact {
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

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ length: 255, nullable: true })
  @Index()
  email?: string;

  @Column({ length: 20 })
  @Index()
  phone!: string;

  @Column({ length: 150, nullable: true })
  @Index()
  companyName?: string;

  @Column({ length: 100, nullable: true })
  designation?: string;

  @Column({
    type: 'enum',
    enum: ContactSource,
    default: ContactSource.MANUAL,
  })
  @Index()
  source!: ContactSource;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.ACTIVE,
  })
  @Index()
  status!: ContactStatus;

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
