import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Loan } from '../loans/loan.entity';
import { FineStatus } from './enums/fine-status.enum';

/** Money owed for one overdue loan — at most one fine per loan. */
@Entity({ name: 'fine' })
@Check(`"amount_cents" >= 0 AND "days_overdue" >= 0`)
export class Fine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'loan_id', type: 'uuid', unique: true })
  loanId!: string;

  @OneToOne(() => Loan, (loan) => loan.fine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loan_id' })
  loan!: Loan;

  /** Gateway user UUID (member) — no DB FK. */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'days_overdue', type: 'int' })
  daysOverdue!: number;

  /** e.g. days_overdue * fine_cents_per_day. */
  @Column({ name: 'amount_cents', type: 'int' })
  amountCents!: number;

  @Column({ type: 'varchar', length: 20, default: FineStatus.Unpaid })
  status!: FineStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  /** Gateway user UUID (staff/admin) — no DB FK. */
  @Column({ name: 'marked_paid_by', type: 'uuid', nullable: true })
  markedPaidBy!: string | null;

  @Column({ name: 'waived_reason', type: 'text', nullable: true })
  waivedReason!: string | null;

  @Column({ name: 'waived_at', type: 'timestamptz', nullable: true })
  waivedAt!: Date | null;

  /** Gateway user UUID (staff/admin) — no DB FK. */
  @Column({ name: 'waived_by', type: 'uuid', nullable: true })
  waivedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
