import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { Fine } from '../fines/fine.entity';
import { MembersModule } from '../members/members.module';
import { Reservation } from '../reservations/reservation.entity';
import { SettingsModule } from '../settings/settings.module';
import { Loan } from './loan.entity';
import { LoansController, MyLoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, BookCopy, Book, Fine, Reservation]),
    MembersModule,
    SettingsModule,
  ],
  controllers: [LoansController, MyLoansController],
  providers: [LoansService],
  exports: [LoansService, TypeOrmModule],
})
export class LoansModule {}
