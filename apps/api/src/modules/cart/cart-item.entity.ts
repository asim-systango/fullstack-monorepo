import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { MenuItem } from '../restaurants/menu-item.entity';

@Entity({ name: 'cart_items' })
@Unique('UQ_cart_items_user_menu_item', ['userId', 'menuItemId'])
@Check('CHK_cart_items_quantity', '"quantity" > 0')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_cart_items_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index('IDX_cart_items_menu_item_id')
  @Column({ name: 'menu_item_id', type: 'uuid' })
  menuItemId: string;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @Column({ type: 'integer', default: 1 })
  quantity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
