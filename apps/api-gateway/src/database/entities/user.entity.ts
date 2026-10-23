import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from './role.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('char', { length: 26 })
  id!: string;

  @Column({ type: 'char', length: 26, nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ type: 'char', length: 26 })
  roleId!: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ length: 255, unique: true })
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
  status!: UserStatus;

  @Column({ default: true })
  isPasswordChangeRequired!: boolean;

  @Column({ type: 'bigint', nullable: true })
  lastLoginAt?: number;
}
