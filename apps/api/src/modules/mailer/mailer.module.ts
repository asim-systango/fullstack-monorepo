import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.entity';
import { Loan } from '../loans/loan.entity';
import { MembersModule } from '../members/members.module';
import { LibraryNotificationsScheduler } from './library-notifications.scheduler';
import { LibraryNotificationsService } from './library-notifications.service';
import { MailerService } from './mailer.service';

@Module({
  imports: [MembersModule, TypeOrmModule.forFeature([Loan, Book])],
  providers: [MailerService, LibraryNotificationsService, LibraryNotificationsScheduler],
  exports: [MailerService, LibraryNotificationsService],
})
export class MailerModule {}
