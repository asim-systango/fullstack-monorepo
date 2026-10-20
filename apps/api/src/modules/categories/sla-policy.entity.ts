import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Category } from './category.entity';
import { SlaPriority } from './sla-priority.enum';

export { SlaPriority };

@Entity('sla_policies')
@Unique(['categoryId', 'priority'])
export class SlaPolicy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: SlaPriority.MEDIUM,
  })
  priority!: SlaPriority;

  @Column({ type: 'integer', name: 'first_response_hours', default: 24 })
  firstResponseHours!: number;

  @Column({ type: 'integer', name: 'resolution_hours', default: 72 })
  resolutionHours!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.slaPolicies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}
