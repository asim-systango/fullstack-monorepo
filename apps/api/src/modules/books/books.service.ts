import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { BookCopy } from './book-copy.entity';
import type { CreateBookDto } from './dto/create-book.dto';
import type { ListBooksQueryDto } from './dto/list-books-query.dto';
import type { UpdateBookDto } from './dto/update-book.dto';
import { BookCopyStatus } from './enums/book-copy-status.enum';

type PaginatedBooks = {
  items: Book[];
  total: number;
  page: number;
  limit: number;
};

type BookDetail = Book & {
  totalCopies: number;
  availableCopies: number;
  onLoanCopies: number;
};

const SORT_COLUMN: Record<string, string> = {
  title: 'book.title',
  author: 'book.author',
  publishedYear: 'book.publishedYear',
  createdAt: 'book.createdAt',
};

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
  ) {}

  async list(query: ListBooksQueryDto): Promise<PaginatedBooks> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.books.createQueryBuilder('book');

    this.applyCatalogFilters(qb, query);
    this.applySort(qb, query.sort);

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async listDeleted(query: ListBooksQueryDto): Promise<PaginatedBooks> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.books
      .createQueryBuilder('book')
      .withDeleted()
      .where('book.deletedAt IS NOT NULL');

    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`;
      qb.andWhere('(book.title ILIKE :q OR book.isbn ILIKE :q)', { q });
    }
    if (query.author?.trim()) {
      qb.andWhere('book.author ILIKE :author', {
        author: `%${query.author.trim()}%`,
      });
    }
    if (query.isbn?.trim()) {
      qb.andWhere('book.isbn = :isbn', { isbn: query.isbn.trim() });
    }

    this.applySort(qb, query.sort);
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<BookDetail> {
    const book = await this.books.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const counts = await this.copies
      .createQueryBuilder('copy')
      .select('COUNT(*)', 'total')
      .addSelect(`SUM(CASE WHEN copy.status = :available THEN 1 ELSE 0 END)`, 'available')
      .addSelect(`SUM(CASE WHEN copy.status = :onLoan THEN 1 ELSE 0 END)`, 'onLoan')
      .where('copy.bookId = :bookId', { bookId: id })
      .andWhere('copy.deleted_at IS NULL')
      .setParameters({
        available: BookCopyStatus.Available,
        onLoan: BookCopyStatus.OnLoan,
      })
      .getRawOne<{ total: string; available: string; onLoan: string }>();

    return Object.assign(book, {
      totalCopies: Number(counts?.total ?? 0),
      availableCopies: Number(counts?.available ?? 0),
      onLoanCopies: Number(counts?.onLoan ?? 0),
    });
  }

  async create(dto: CreateBookDto, createdBy: string): Promise<Book> {
    const book = this.books.create({
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn,
      description: dto.description ?? null,
      publishedYear: dto.publishedYear ?? null,
      createdBy,
    });
    return this.books.save(book);
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const book = await this.requireActiveBook(id);
    if (dto.title !== undefined) book.title = dto.title;
    if (dto.author !== undefined) book.author = dto.author;
    if (dto.isbn !== undefined) book.isbn = dto.isbn;
    if (dto.description !== undefined) book.description = dto.description;
    if (dto.publishedYear !== undefined) book.publishedYear = dto.publishedYear;
    return this.books.save(book);
  }

  async softDelete(id: string): Promise<void> {
    await this.requireActiveBook(id);

    const onLoanCount = await this.copies.count({
      where: { bookId: id, status: BookCopyStatus.OnLoan },
    });
    if (onLoanCount > 0) {
      throw new ConflictException(
        'Cannot delete book while one or more copies are on loan',
      );
    }

    await this.books.softDelete(id);
  }

  async restore(id: string): Promise<Book> {
    const book = await this.books.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!book || !book.deletedAt) {
      throw new NotFoundException('Deleted book not found');
    }
    await this.books.recover(book);
    return this.requireActiveBook(id);
  }

  /** Ensures the book exists and is not soft-deleted. */
  async requireActiveBook(id: string): Promise<Book> {
    const book = await this.books.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  private applyCatalogFilters(
    qb: ReturnType<Repository<Book>['createQueryBuilder']>,
    query: ListBooksQueryDto,
  ): void {
    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`;
      qb.andWhere('(book.title ILIKE :q OR book.isbn ILIKE :q)', { q });
    }
    if (query.author?.trim()) {
      qb.andWhere('book.author ILIKE :author', {
        author: `%${query.author.trim()}%`,
      });
    }
    if (query.isbn?.trim()) {
      qb.andWhere('book.isbn = :isbn', { isbn: query.isbn.trim() });
    }
    if (query.availableOnly) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM book_copy copy
          WHERE copy.book_id = book.id
            AND copy.deleted_at IS NULL
            AND copy.status = :availableStatus
        )`,
        { availableStatus: BookCopyStatus.Available },
      );
    }
  }

  private applySort(
    qb: ReturnType<Repository<Book>['createQueryBuilder']>,
    sort?: string,
  ): void {
    const raw = sort ?? 'title';
    const descending = raw.startsWith('-');
    const field = descending ? raw.slice(1) : raw;
    const column = SORT_COLUMN[field] ?? 'book.title';
    qb.orderBy(column, descending ? 'DESC' : 'ASC');
  }
}
