import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Ward } from './ward.entity';

@Entity({ name: 'beds' })
export class Bed extends BaseEntity {
  @Index()
  @Column({ name: 'ward_id', type: 'uuid' })
  wardId!: string;

  @ManyToOne(() => Ward, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ward_id' })
  ward?: Ward;

  @Column({ name: 'bed_number', type: 'varchar', length: 30 })
  bedNumber!: string;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'AVAILABLE' })
  status!: string;
}
