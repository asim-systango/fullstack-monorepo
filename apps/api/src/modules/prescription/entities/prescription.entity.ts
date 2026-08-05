import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity.js';
import { Appointment } from '../../appointment/entities/appointment.entity.js';

/**
 * Prescription attached to a completed appointment (1:1).
 * Contains structured medicines data and text instructions.
 */
@Entity({ name: 'prescriptions' })
export class Prescription extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  appointmentId!: string;

  @Column({ type: 'jsonb', default: [] })
  medicines!: Record<string, unknown>[];

  @Column({ type: 'text', nullable: true })
  instructions!: string | null;

  /** The appointment this prescription belongs to. */
  @OneToOne(() => Appointment, (appointment: Appointment) => appointment.prescription, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment?: Appointment;
}
