import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { Fine } from '../fines/fine.entity';
import { Loan } from '../loans/loan.entity';
import { MemberProfile } from '../members/member-profile.entity';
import { Reservation } from '../reservations/reservation.entity';
import { SettingsModule } from '../settings/settings.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, BookCopy, Loan, Reservation, Fine, MemberProfile]),
    SettingsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
