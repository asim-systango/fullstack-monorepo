import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { BookCopy } from './book-copy.entity';
import { BooksService } from './books.service';
import type { CreateBookCopyDto } from './dto/create-book-copy.dto';
import type { UpdateBookCopyDto } from './dto/update-book-copy.dto';
import { BookCopyStatus } from './enums/book-copy-status.enum';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = err.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

/** Staff PATCH may only flip available ↔ lost (or no-op same status). */
function assertStatusTransition(from: BookCopyStatus, to: BookCopyStatus): void {
  if (from === to) return;

  if (to === BookCopyStatus.OnLoan) {
    throw new BadRequestException(
      'Cannot set status to on_loan via this endpoint; use loan checkout',
    );
  }
  if (from === BookCopyStatus.OnLoan) {
    throw new BadRequestException(
      'Cannot change status of a copy that is on loan via this endpoint; use loan return',
    );
  }

  const allowed =
    (from === BookCopyStatus.Available && to === BookCopyStatus.Lost) ||
    (from === BookCopyStatus.Lost && to === BookCopyStatus.Available);

  if (!allowed) {
    throw new BadRequestException(`Invalid status transition from ${from} to ${to}`);
  }
}

@Injectable()
export class BookCopiesService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
    private readonly booksService: BooksService,
  ) {}

  async listByBook(bookId: string): Promise<BookCopy[]> {
    await this.booksService.requireActiveBook(bookId);
    return this.copies.find({
      where: { bookId },
      order: { acquiredAt: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(bookId: string, dto: CreateBookCopyDto): Promise<BookCopy> {
    await this.booksService.requireActiveBook(bookId);

    const copy = this.copies.create({
      bookId,
      barcode: dto.barcode,
      status: BookCopyStatus.Available,
      acquiredAt: dto.acquiredAt ?? null,
    });

    try {
      return await this.copies.save(copy);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Barcode already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateBookCopyDto): Promise<BookCopy> {
    const copy = await this.requireActiveCopy(id);

    if (dto.status !== undefined) {
      assertStatusTransition(copy.status, dto.status);
      copy.status = dto.status;
    }
    if (dto.barcode !== undefined) {
      copy.barcode = dto.barcode;
    }

    try {
      return await this.copies.save(copy);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Barcode already exists');
      }
      throw err;
    }
  }

  async softDelete(id: string): Promise<void> {
    const copy = await this.requireActiveCopy(id);
    if (copy.status === BookCopyStatus.OnLoan) {
      throw new ConflictException('Cannot delete a copy that is on loan');
    }
    await this.copies.softDelete(id);
  }

  private async requireActiveCopy(id: string): Promise<BookCopy> {
    const copy = await this.copies.findOne({ where: { id } });
    if (!copy) {
      throw new NotFoundException('Book copy not found');
    }
    return copy;
  }
}
