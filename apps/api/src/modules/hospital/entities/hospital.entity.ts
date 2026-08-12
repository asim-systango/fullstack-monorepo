import { Column, DeleteDateColumn, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity({ name: 'hospitals' })
export class Hospital extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'license_number', type: 'varchar', length: 100, unique: true })
  licenseNumber!: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 150 })
  contactEmail!: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 30 })
  contactPhone!: string;

  @Column({ type: 'jsonb' })
  address!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status!: string;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
