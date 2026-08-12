import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';
import { Slot } from '../../slot/entities/slot.entity';
import type { Prescription } from '../../prescription/entities/prescription.entity';
import type { MedicalNote } from '../../medical-note/entities/medical-note.entity';

/**
 * Patient appointment booking.
 * Linked to a Slot (1:1) and a gateway User via patientId.
 * Soft-deleted on cancellation (deletedAt set, status → CANCELLED).
 */
@Entity({ name: 'appointments' })
export class Appointment extends BaseEntity {
  @Index()
  @Column({ name: 'hospital_id', type: 'uuid', nullable: true })
  hospitalId!: string | null;

  @Index()
  @Column({ type: 'uuid' })
  patientId!: string;

  @Column({ type: 'varchar', length: 20, default: 'IN_PERSON' })
  type!: string;

  @Column({ type: 'uuid', unique: true })
  slotId!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  consultationFee!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 10 })
  hospitalCharge!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 10 })
  totalAmount!: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  /** The slot this appointment reserves. */
  @OneToOne(() => Slot, (slot: Slot) => slot.appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slotId' })
  slot?: Slot;

  /** Populated when prescription relation is loaded. */
  @OneToOne('Prescription', 'appointment')
  prescription?: Prescription;

  /** Populated when medical notes relation is loaded. */
  @OneToMany('MedicalNote', 'appointment')
  medicalNotes?: MedicalNote[];
}
