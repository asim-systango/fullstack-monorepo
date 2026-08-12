import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Prescription } from './prescription.entity';

@Entity({ name: 'prescription_items' })
export class PrescriptionItem extends BaseEntity {
  @Index()
  @Column({ name: 'prescription_id', type: 'uuid' })
  prescriptionId!: string;

  @ManyToOne(() => Prescription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription?: Prescription;

  @Column({ name: 'medicine_name', type: 'varchar', length: 200 })
  medicineName!: string;

  @Column({ type: 'varchar', length: 50 })
  dosage!: string;

  @Column({ type: 'varchar', length: 50 })
  frequency!: string;

  @Column({ name: 'duration_days', type: 'int' })
  durationDays!: number;

  @Column({ type: 'varchar', length: 50, default: 'ORAL' })
  route!: string;
}
