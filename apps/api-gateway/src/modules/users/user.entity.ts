import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Rename `staff` to a domain role (company, agent, coach, …). */
export type UserRole = 'admin' | 'user' | 'staff';

export type OtpPurpose = 'signup' | 'password_reset';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'citext', unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role!: UserRole;

  /** Set after successful signup OTP verification. */
  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'otp_hash', type: 'text', nullable: true })
  otpHash!: string | null;

  @Column({ name: 'otp_expires_at', type: 'timestamptz', nullable: true })
  otpExpiresAt!: Date | null;

  @Column({ name: 'otp_attempts', type: 'int', default: 0 })
  otpAttempts!: number;

  @Column({ name: 'otp_sent_at', type: 'timestamptz', nullable: true })
  otpSentAt!: Date | null;

  @Column({ name: 'otp_purpose', type: 'varchar', length: 32, nullable: true })
  otpPurpose!: OtpPurpose | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
