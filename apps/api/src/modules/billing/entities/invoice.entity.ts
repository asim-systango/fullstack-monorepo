import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Hospital } from '../../hospital/entities/hospital.entity';

@Entity({ name: 'invoices' })
export class Invoice extends BaseEntity {
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
  @Column({ name: 'encounter_id', type: 'uuid', nullable: true })
  encounterId!: string | null;

  @Index({ unique: true })
  @Column({ name: 'invoice_number', type: 'varchar', length: 50 })
  invoiceNumber!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({
    name: 'discount_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount!: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'paid_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  paidAmount!: number;

  @Index()
  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: 'PENDING' })
  paymentStatus!: string;
}
