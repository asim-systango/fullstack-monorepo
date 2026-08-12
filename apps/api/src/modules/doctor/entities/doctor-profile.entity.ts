import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import type { Slot } from '../../slot/entities/slot.entity';

/**
 * Doctor professional profile.
 * Linked to a gateway User via userId (1:1).
 * A doctor can have many consultation Slots (1:N).
 */
@Entity({ name: 'doctor_profiles' })
export class DoctorProfile extends BaseEntity {
  @Index()
  @Column({ name: 'hospital_id', type: 'uuid', nullable: true })
  hospitalId!: string | null;

  @Column({ name: 'medical_license', type: 'varchar', length: 100, nullable: true })
  medicalLicense!: string | null;

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

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 10 })
  hospitalCharge!: number;

  @Column({ type: 'text', nullable: true })
  biography!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 20, default: 'APPROVED' })
  approvalStatus!: 'PENDING' | 'APPROVED' | 'REJECTED';

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  /** Populated when slots relation is loaded — not eager by default. */
  @OneToMany('Slot', 'doctor')
  slots?: Slot[];
}
