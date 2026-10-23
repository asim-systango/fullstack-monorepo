import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WarehouseEntity } from './WarehouseEntity';
import { ProductEntity } from './ProductEntity';
import { UserEntity } from './UserEntity';

export type MovementType = 'inbound' | 'outbound' | 'adjustment' | 'transfer';

@Entity({ name: 'stock_movements' })
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: false })
  warehouseId!: string;

  @Column({ name: 'source_warehouse_id', type: 'uuid', nullable: true })
  sourceWarehouseId?: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId!: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  type!: MovementType;

  @Column({ type: 'int', nullable: false })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.movements)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: WarehouseEntity;

  @ManyToOne(() => WarehouseEntity)
  @JoinColumn({ name: 'source_warehouse_id' })
  sourceWarehouse?: WarehouseEntity;

  @ManyToOne(() => ProductEntity, (product) => product.movements)
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
