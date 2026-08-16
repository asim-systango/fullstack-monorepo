import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookCopy } from './book-copy.entity';
import { BookCopiesController, CopiesController } from './book-copies.controller';
import { BookCopiesService } from './book-copies.service';
import { BookActionsService } from './book-actions.service';
import { BooksController, MyBookActionsController } from './books.controller';
import { BooksService } from './books.service';
import { CheckoutRequest } from '../checkout-requests/checkout-request.entity';
import { Loan } from '../loans/loan.entity';
import { Reservation } from '../reservations/reservation.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookCopy, Loan, Reservation, CheckoutRequest]),
    SettingsModule,
  ],
  controllers: [
    BooksController,
    MyBookActionsController,
    BookCopiesController,
    CopiesController,
  ],
  providers: [BooksService, BookCopiesService, BookActionsService],
  exports: [BooksService, BookCopiesService, TypeOrmModule],
})
export class BooksModule {}
