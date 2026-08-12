import { Column, DeleteDateColumn, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';

@Entity({ name: 'patient_profiles' })
export class PatientProfile extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ name: 'hospital_id', type: 'uuid' })
  hospitalId!: string;

  @ManyToOne(() => Hospital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  mrn!: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth!: string;

  @Column({ type: 'varchar', length: 20 })
  gender!: string;

  @Column({ name: 'blood_group', type: 'varchar', length: 10, nullable: true })
  bloodGroup!: string | null;

  @Column({ name: 'emergency_contact', type: 'jsonb' })
  emergencyContact!: Record<string, unknown>;

  @Column({ name: 'medical_history', type: 'jsonb', default: {} })
  medicalHistory!: Record<string, unknown>;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
