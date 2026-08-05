import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity.js';
import type { Slot } from '../../slot/entities/slot.entity.js';

/**
 * Doctor professional profile.
 * Linked to a gateway User via userId (1:1).
 * A doctor can have many consultation Slots (1:N).
 */
@Entity({ name: 'doctor_profiles' })
export class DoctorProfile extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  firstName!: string;

  @Column({ type: 'varchar', length: 50 })
  lastName!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  specialization!: string;

  @Column({ type: 'varchar', length: 100 })
  qualification!: string;

  @Column({ type: 'int', default: 0 })
  experienceYears!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  consultationFee!: number;

  @Column({ type: 'text', nullable: true })
  biography!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  /** Populated when slots relation is loaded — not eager by default. */
  @OneToMany('Slot', 'doctor')
  slots?: Slot[];
}
