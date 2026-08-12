import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from '../../appointment/entities/appointment.entity';

export enum InsuranceClaimStatus {
  SUBMITTED = 'SUBMITTED',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('insurance_claims')
export class InsuranceClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @Column({ name: 'provider_name' })
  providerName: string;

  @Column({ name: 'policy_number' })
  policyNumber: string;

  @Column({ name: 'claim_amount', type: 'decimal', precision: 10, scale: 2 })
  claimAmount: number;

  @Column({
    name: 'covered_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  coveredAmount: number;

  @Column({ name: 'copay_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  copayAmount: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: InsuranceClaimStatus.SUBMITTED,
  })
  status: InsuranceClaimStatus | string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
