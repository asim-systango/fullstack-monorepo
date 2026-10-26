import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'leave_types' })
@Check('CHK_leave_types_default_days', '"defaultDays" BETWEEN 0 AND 366')
export class LeaveType {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_leave_types' })
  id!: string;

  @Column({ type: 'varchar', length: 60 })
  name!: string;

  @Column({ type: 'int' })
  defaultDays!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // plain column on purpose, @DeleteDateColumn would hide archived types in joins
  @Column({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
