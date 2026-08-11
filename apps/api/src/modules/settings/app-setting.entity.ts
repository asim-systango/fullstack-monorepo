import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AppSettingValueType } from './enums/app-setting-value-type.enum';

/**
 * Global key/value configuration (e.g. max_active_loans, fine_cents_per_day).
 * Admins write; services read.
 */
@Entity({ name: 'app_setting' })
export class AppSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({
    name: 'value_type',
    type: 'varchar',
    length: 20,
    default: AppSettingValueType.Integer,
  })
  valueType!: AppSettingValueType;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Gateway user UUID (admin) — no DB FK. */
  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
