import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StockLevelEntity } from './StockLevelEntity';
import { StockMovementEntity } from './StockMovementEntity';

@Entity({ name: 'warehouses' })
export class WarehouseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  code!: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: false })
  location!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: false })
  updatedAt!: Date;

  @OneToMany(() => StockLevelEntity, (stockLevel) => stockLevel.warehouse)
  stockLevels?: StockLevelEntity[];

  @OneToMany(() => StockMovementEntity, (movement) => movement.warehouse)
  movements?: StockMovementEntity[];
}
