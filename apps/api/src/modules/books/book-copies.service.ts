import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookCopy } from './book-copy.entity';
import type { CreateBookCopyDto } from './dto/create-book-copy.dto';
import type { UpdateBookCopyDto } from './dto/update-book-copy.dto';

@Injectable()
export class BookCopiesService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly copies: Repository<BookCopy>,
  ) {}

  // Scaffold — implement copy CRUD under /books/:bookId/copies next.
  listByBook(_bookId: string): Promise<BookCopy[]> {
    return Promise.resolve([]);
  }

  create(_bookId: string, _dto: CreateBookCopyDto): Promise<BookCopy> {
    throw new Error('Not implemented');
  }

  update(_bookId: string, _copyId: string, _dto: UpdateBookCopyDto): Promise<BookCopy> {
    throw new Error('Not implemented');
  }

  softDelete(_bookId: string, _copyId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
