import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import type { CreateBookDto } from './dto/create-book.dto';
import type { ListBooksQueryDto } from './dto/list-books-query.dto';
import type { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly books: Repository<Book>,
  ) {}

  // Scaffold — implement catalog CRUD + soft-delete + filters next.
  list(_query: ListBooksQueryDto): Promise<{ items: Book[]; total: number }> {
    return Promise.resolve({ items: [], total: 0 });
  }

  create(_dto: CreateBookDto): Promise<Book> {
    throw new Error('Not implemented');
  }

  findOne(_id: string): Promise<Book> {
    throw new Error('Not implemented');
  }

  update(_id: string, _dto: UpdateBookDto): Promise<Book> {
    throw new Error('Not implemented');
  }

  softDelete(_id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
