import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from '../../appointment/entities/appointment.entity.js';
import { DoctorProfile } from '../../doctor/entities/doctor-profile.entity.js';

/**
 * Clinical consultation note attached to an appointment.
 * One appointment can have multiple notes (1:N).
 * Authored by a doctor.
 */
@Entity({ name: 'medical_notes' })
export class MedicalNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  appointmentId!: string;

  @Index()
  @Column({ type: 'uuid' })
  doctorId!: string;

  @Column({ type: 'text' })
  notes!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  /** The appointment this note belongs to. */
  @ManyToOne(() => Appointment, (appointment: Appointment) => appointment.medicalNotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment?: Appointment;

  /** The doctor who authored this note. */
  @ManyToOne(() => DoctorProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor?: DoctorProfile;
}
