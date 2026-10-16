import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { CheckoutRequest } from '../checkout-requests/checkout-request.entity';
import { Fine } from '../fines/fine.entity';
import { FinesModule } from '../fines/fines.module';
import { Loan } from '../loans/loan.entity';
import { MemberProfile } from '../members/member-profile.entity';
import { Reservation } from '../reservations/reservation.entity';
import { SettingsModule } from '../settings/settings.module';
import { User } from '../users/user.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      BookCopy,
      Loan,
      Reservation,
      Fine,
      MemberProfile,
      User,
      CheckoutRequest,
    ]),
    SettingsModule,
    FinesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
