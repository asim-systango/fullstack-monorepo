import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Invoice } from './invoice.entity';

@Entity({ name: 'invoice_items' })
export class InvoiceItem extends BaseEntity {
  @Index()
  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId!: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice;

  @Column({ name: 'item_type', type: 'varchar', length: 30 })
  itemType!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'total_price', type: 'numeric', precision: 10, scale: 2 })
  totalPrice!: number;
}
