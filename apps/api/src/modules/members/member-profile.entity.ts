import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberStatus } from './enums/member-status.enum';

/**
 * Library-side state for one gateway user (role user).
 * Auth identity stays on the gateway — this is not a User table.
 */
@Entity({ name: 'member_profile' })
export class MemberProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Gateway user UUID — unique, no DB FK across services. */
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId!: string;

  /** Read-only mirror of gateway email for desk search. */
  @Column({ type: 'citext' })
  email!: string;

  /** Read-only mirror of gateway name for desk search. */
  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName!: string;

  @Column({ type: 'varchar', length: 20, default: MemberStatus.Active })
  status!: MemberStatus;

  @Column({ name: 'suspended_reason', type: 'text', nullable: true })
  suspendedReason!: string | null;

  @Column({ name: 'suspended_at', type: 'timestamptz', nullable: true })
  suspendedAt!: Date | null;

  /** Gateway user UUID (admin) — no DB FK. */
  @Column({ name: 'suspended_by', type: 'uuid', nullable: true })
  suspendedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
