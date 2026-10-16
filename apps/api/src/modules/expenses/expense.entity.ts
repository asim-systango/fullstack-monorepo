import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @Column({ name: 'payer_user_id', type: 'uuid' })
  payerUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payer_user_id' })
  payer!: User;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy!: User;

  @Column({ length: 500 })
  description!: string;

  @Column({ name: 'amount_cents', type: 'integer' })
  amountCents!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ name: 'expense_date', type: 'timestamptz' })
  expenseDate!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'deleted_by_user_id', type: 'uuid', nullable: true })
  deletedByUserId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'deleted_by_user_id' })
  deletedBy!: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
