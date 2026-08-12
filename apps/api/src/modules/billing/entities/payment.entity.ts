import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Invoice } from './invoice.entity';

@Entity({ name: 'payments' })
export class Payment extends BaseEntity {
  @Index()
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId!: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice;

  @Column({ name: 'payment_method', type: 'varchar', length: 30 })
  paymentMethod!: string;

  @Column({ name: 'transaction_ref', type: 'varchar', length: 100, nullable: true })
  transactionRef!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 20, default: 'SUCCESS' })
  status!: string;
}
