import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'holidays' })
@Unique('UQ_holidays_date', ['date'])
export class Holiday {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_holidays' })
  id!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
