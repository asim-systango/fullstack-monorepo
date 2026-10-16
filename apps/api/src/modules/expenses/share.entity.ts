import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Expense } from './expense.entity';

@Entity({ name: 'shares' })
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'expense_id', type: 'uuid' })
  expenseId!: string;

  @ManyToOne(() => Expense, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_id' })
  expense!: Expense;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'amount_cents', type: 'integer' })
  amountCents!: number;
}
