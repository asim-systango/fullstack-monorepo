import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.entity';
import { BookCopy } from '../books/book-copy.entity';
import { LoansModule } from '../loans/loans.module';
import { MemberProfile } from '../members/member-profile.entity';
import { MembersModule } from '../members/members.module';
import { SettingsModule } from '../settings/settings.module';
import { CheckoutRequest } from './checkout-request.entity';
import {
  CheckoutRequestsController,
  MyCheckoutRequestsController,
} from './checkout-requests.controller';
import { CheckoutRequestsService } from './checkout-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutRequest, Book, BookCopy, MemberProfile]),
    MembersModule,
    SettingsModule,
    LoansModule,
  ],
  controllers: [CheckoutRequestsController, MyCheckoutRequestsController],
  providers: [CheckoutRequestsService],
  exports: [CheckoutRequestsService, TypeOrmModule],
})
export class CheckoutRequestsModule {}
