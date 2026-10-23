import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { WarehouseEntity } from './WarehouseEntity';
import { ProductEntity } from './ProductEntity';

@Entity({ name: 'stock_levels' })
@Index(['warehouseId', 'productId'], { unique: true })
@Check(`"quantity" >= 0`)
export class StockLevelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: false })
  warehouseId!: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId!: string;

  @Column({ type: 'int', default: 0, nullable: false })
  quantity!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt!: Date;

  @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.stockLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: WarehouseEntity;

  @ManyToOne(() => ProductEntity, (product) => product.stockLevels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;
}
