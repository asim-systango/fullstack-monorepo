import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { BookCopy } from './book-copy.entity';
import type { Loan } from '../loans/loan.entity';
import type { Reservation } from '../reservations/reservation.entity';

/**
 * Catalog title — primary listable resource (soft-delete).
 * Availability is never stored here; it lives on `book_copy`.
 */
@Entity({ name: 'book' })
@Index('idx_book_catalog_active', ['title', 'author', 'isbn'], {
  where: '"deleted_at" IS NULL',
})
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'varchar', length: 200 })
  author!: string;

  @Column({ type: 'varchar', length: 20 })
  isbn!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'published_year', type: 'smallint', nullable: true })
  publishedYear!: number | null;

  /** Gateway user UUID (staff) — no DB FK across services. */
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @OneToMany('BookCopy', 'book')
  copies?: BookCopy[];

  @OneToMany('Loan', 'book')
  loans?: Loan[];

  @OneToMany('Reservation', 'book')
  reservations?: Reservation[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
