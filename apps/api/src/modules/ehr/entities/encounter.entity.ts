import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';

@Entity({ name: 'encounters' })
export class Encounter extends BaseEntity {
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
  @Column({ name: 'attending_doctor_id', type: 'uuid' })
  attendingDoctorId!: string;

  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointmentId!: string | null;

  @Column({ name: 'admission_id', type: 'uuid', nullable: true })
  admissionId!: string | null;

  @Column({ type: 'varchar', length: 20 })
  type!: string;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime!: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'IN_PROGRESS' })
  status!: string;
}
