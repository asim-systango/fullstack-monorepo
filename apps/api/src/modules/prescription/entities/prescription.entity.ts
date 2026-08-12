import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

/**
 * Prescription attached to a completed appointment (1:1).
 * Contains structured medicines data and text instructions.
 */
@Entity({ name: 'prescriptions' })
export class Prescription extends BaseEntity {
  @Column({ name: 'encounter_id', type: 'uuid', nullable: true })
  encounterId!: string | null;

  @Column({ type: 'uuid', unique: true })
  appointmentId!: string;

  @Column({ type: 'text', nullable: true })
  diagnosis!: string | null;

  @Column({ type: 'jsonb', default: [] })
  medicines!: Record<string, unknown>[];

  @Column({ type: 'text', nullable: true })
  instructions!: string | null;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil!: string | null;

  /** The appointment this prescription belongs to. */
  @OneToOne(() => Appointment, (appointment: Appointment) => appointment.prescription, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment?: Appointment;
}
