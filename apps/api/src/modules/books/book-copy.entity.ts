import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Loan } from '../loans/loan.entity';
import { Book } from './book.entity';
import { BookCopyStatus } from './enums/book-copy-status.enum';

/** One physical item on the shelf — availability lives here. */
@Entity({ name: 'book_copy' })
@Index('idx_book_copy_book_status', ['bookId', 'status'])
export class BookCopy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'book_id', type: 'uuid' })
  bookId!: string;

  @ManyToOne(() => Book, (book) => book.copies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Index('uq_book_copy_barcode', { unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  barcode!: string;

  @Column({ type: 'varchar', length: 20, default: BookCopyStatus.Available })
  status!: BookCopyStatus;

  @Column({ name: 'acquired_at', type: 'date', nullable: true })
  acquiredAt!: string | null;

  @OneToMany('Loan', 'bookCopy')
  loans?: Loan[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
