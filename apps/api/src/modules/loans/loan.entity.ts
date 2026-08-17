import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import type { Fine } from '../fines/fine.entity';

/**
 * One member holding one physical copy from checkout until return.
 * Loan "status" is derived on read from returned_at + due_date (not stored).
 */
@Entity({ name: 'loan' })
@Index('uq_loan_active_copy', ['bookCopyId'], {
  unique: true,
  where: '"returned_at" IS NULL',
})
@Index('uq_loan_active_user_title', ['userId', 'bookId'], {
  unique: true,
  where: '"returned_at" IS NULL',
})
@Index('idx_loan_active_user_due', ['userId', 'dueDate'], {
  where: '"returned_at" IS NULL',
})
@Check(`"returned_at" IS NULL OR "returned_at" >= "borrowed_at"`)
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Gateway user UUID (member) — no DB FK. */
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'book_copy_id', type: 'uuid' })
  bookCopyId!: string;

  @ManyToOne(() => BookCopy, (copy) => copy.loans, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'book_copy_id' })
  bookCopy!: BookCopy;

  /** Denormalized title link for history / filters. */
  @Column({ name: 'book_id', type: 'uuid' })
  bookId!: string;

  @ManyToOne(() => Book, (book) => book.loans, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column({ name: 'borrowed_at', type: 'timestamptz', default: () => 'now()' })
  borrowedAt!: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: string;

  @Column({ name: 'returned_at', type: 'timestamptz', nullable: true })
  returnedAt!: Date | null;

  /** Gateway user UUID (staff) — no DB FK. */
  @Column({ name: 'checked_out_by', type: 'uuid' })
  checkedOutBy!: string;

  /** Gateway user UUID (staff) — no DB FK. */
  @Column({ name: 'returned_to', type: 'uuid', nullable: true })
  returnedTo!: string | null;

  @Column({ name: 'reminder_sent_at', type: 'timestamptz', nullable: true })
  reminderSentAt!: Date | null;

  @Column({ name: 'overdue_notified_at', type: 'timestamptz', nullable: true })
  overdueNotifiedAt!: Date | null;

  @OneToOne('Fine', 'loan')
  fine?: Fine | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
