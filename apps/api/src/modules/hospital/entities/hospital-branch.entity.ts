import { Column, DeleteDateColumn, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Hospital } from './hospital.entity';

@Entity({ name: 'hospital_branches' })
export class HospitalBranch extends BaseEntity {
  @Index()
  @Column({ name: 'hospital_id', type: 'uuid' })
  hospitalId!: string;

  @ManyToOne(() => Hospital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital?: Hospital;

  @Column({ name: 'branch_code', type: 'varchar', length: 20 })
  branchCode!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'jsonb' })
  address!: Record<string, unknown>;

  @Column({ name: 'contact_phone', type: 'varchar', length: 30 })
  contactPhone!: string;

  @Column({ name: 'is_main', type: 'boolean', default: false })
  isMain!: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
