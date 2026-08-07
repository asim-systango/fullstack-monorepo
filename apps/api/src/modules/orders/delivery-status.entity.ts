import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order, OrderStatus } from './order.entity';

@Entity({ name: 'delivery_statuses' })
@Check(
  'CHK_delivery_statuses_status',
  `"status" IN ('placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')`,
)
export class DeliveryStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_delivery_statuses_order_id')
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.deliveryStatuses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 30 })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
