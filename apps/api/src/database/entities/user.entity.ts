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
import { Role } from './role.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = ulid();
    }
  }

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  organizationId?: string;

  @ManyToOne(() => Organization, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ type: 'char', length: 26 })
  @Index()
  roleId!: string;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ length: 255, unique: true })
  @Index()
  email!: string;

  @Column({ length: 255 })
  passwordHash!: string;

  @Column({ length: 30, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @Index()
  status!: UserStatus;

  @Column({ default: true })
  @Index()
  isPasswordChangeRequired!: boolean;

  @Column({ type: 'bigint', nullable: true })
  lastLoginAt?: number;

  @Column({ type: 'char', length: 26, nullable: true })
  @Index()
  createdBy?: string;

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
