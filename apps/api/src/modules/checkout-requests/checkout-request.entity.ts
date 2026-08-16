import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { Loan } from '../loans/loan.entity';
import { CheckoutRequestStatus } from './enums/checkout-request-status.enum';

/**
 * Member asks for a title; librarian issues a physical copy.
 * `fulfilled` is only valid when loan_id is set (actual issuance).
 */
@Entity({ name: 'checkout_request' })
@Index('uq_checkout_request_pending_user_book', ['userId', 'bookId'], {
  unique: true,
  where: `"status" = 'pending'`,
})
@Index('idx_checkout_request_status_created', ['status', 'createdAt'])
@Check(`"status" <> 'fulfilled' OR "loan_id" IS NOT NULL`)
export class CheckoutRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Gateway user UUID (member) — no DB FK. */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'book_id', type: 'uuid' })
  bookId!: string;

  @ManyToOne(() => Book, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ type: 'varchar', length: 20, default: CheckoutRequestStatus.Pending })
  status!: CheckoutRequestStatus;

  @Column({ name: 'loan_id', type: 'uuid', nullable: true })
  loanId!: string | null;

  @ManyToOne(() => Loan, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'loan_id' })
  loan!: Loan | null;

  @Column({ name: 'book_copy_id', type: 'uuid', nullable: true })
  bookCopyId!: string | null;

  @ManyToOne(() => BookCopy, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'book_copy_id' })
  bookCopy!: BookCopy | null;

  /** Gateway user UUID (staff) — no DB FK. */
  @Column({ name: 'issued_by', type: 'uuid', nullable: true })
  issuedBy!: string | null;

  @Column({ name: 'rejected_reason', type: 'text', nullable: true })
  rejectedReason!: string | null;

  @Column({ name: 'fulfilled_at', type: 'timestamptz', nullable: true })
  fulfilledAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
