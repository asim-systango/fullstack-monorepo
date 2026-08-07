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
import { decimalToNumber } from '../../common/decimal.transformer';
import { MenuItem } from '../restaurants/menu-item.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_lines' })
@Check('CHK_order_lines_quantity', '"quantity" > 0')
@Check('CHK_order_lines_unit_price', '"unit_price" >= 0')
export class OrderLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_order_lines_order_id')
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'menu_item_id', type: 'uuid', nullable: true })
  menuItemId: string | null;

  @ManyToOne(() => MenuItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem | null;

  // Name and price are copied from the menu when the order is created.
  @Column({ name: 'item_name', length: 120 })
  itemName: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: decimalToNumber,
  })
  unitPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
