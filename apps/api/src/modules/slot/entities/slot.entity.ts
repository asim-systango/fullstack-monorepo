import { Column, Entity, Index, ManyToOne, OneToOne, JoinColumn, Check } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity.js';
import { SlotStatus } from '../../../shared/enums/slot-status.enum.js';
import { DoctorProfile } from '../../doctor/entities/doctor-profile.entity.js';
import type { Appointment } from '../../appointment/entities/appointment.entity.js';

/**
 * Consultation time slot for a doctor.
 * Duration: 30 minutes (validated at service layer).
 * CHECK constraint ensures startsAt < endsAt.
 */
@Entity({ name: 'slots' })
@Check('"starts_at" < "ends_at"')
export class Slot extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  doctorId!: string;

  @Index()
  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Index()
  @Column({
    type: 'enum',
    enum: SlotStatus,
    default: SlotStatus.AVAILABLE,
  })
  status!: SlotStatus;

  /** The doctor who owns this slot. */
  @ManyToOne(() => DoctorProfile, (doctor: DoctorProfile) => doctor.slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor?: DoctorProfile;

  /** Populated when the appointment relation is loaded. */
  @OneToOne('Appointment', 'slot')
  appointment?: Appointment;
}
