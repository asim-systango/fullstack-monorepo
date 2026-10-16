import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { Loan } from '../loans/loan.entity';
import { MembersModule } from '../members/members.module';
import { Reservation } from './reservation.entity';
import {
  BookReservationsController,
  MyReservationsController,
  ReservationsController,
} from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Book, BookCopy, Loan]), MembersModule],
  controllers: [
    ReservationsController,
    MyReservationsController,
    BookReservationsController,
  ],
  providers: [ReservationsService],
  exports: [ReservationsService, TypeOrmModule],
})
export class ReservationsModule {}
