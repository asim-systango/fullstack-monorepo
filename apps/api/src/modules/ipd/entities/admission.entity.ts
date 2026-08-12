import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';
import { Bed } from './bed.entity';

@Entity({ name: 'admissions' })
export class Admission extends BaseEntity {
  @Index()
  @Column({ name: 'hospital_id', type: 'uuid' })
  hospitalId!: string;

  @ManyToOne(() => Hospital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital;

  @Index()
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @Index()
  @Column({ name: 'bed_id', type: 'uuid' })
  bedId!: string;

  @ManyToOne(() => Bed, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bed_id' })
  bed?: Bed;

  @Index()
  @Column({ name: 'admitting_doctor_id', type: 'uuid' })
  admittingDoctorId!: string;

  @Column({ name: 'admitted_at', type: 'timestamptz' })
  admittedAt!: Date;

  @Column({ name: 'discharged_at', type: 'timestamptz', nullable: true })
  dischargedAt!: Date | null;

  @Column({ name: 'discharge_summary', type: 'text', nullable: true })
  dischargeSummary!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'ADMITTED' })
  status!: string;
}
