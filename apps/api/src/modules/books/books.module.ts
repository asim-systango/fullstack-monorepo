import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookCopy } from './book-copy.entity';
import { BookCopiesController, CopiesController } from './book-copies.controller';
import { BookCopiesService } from './book-copies.service';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book, BookCopy])],
  controllers: [BooksController, BookCopiesController, CopiesController],
  providers: [BooksService, BookCopiesService],
  exports: [BooksService, BookCopiesService, TypeOrmModule],
})
export class BooksModule {}
