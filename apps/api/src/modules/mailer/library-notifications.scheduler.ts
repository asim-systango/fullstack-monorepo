import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addDaysIso, todayIsoDate } from '../../common/iso-date';
import { Loan } from '../loans/loan.entity';
import { LibraryNotificationsService } from './library-notifications.service';

@Injectable()
export class LibraryNotificationsScheduler {
  private readonly logger = new Logger(LibraryNotificationsScheduler.name);

  constructor(
    @InjectRepository(Loan)
    private readonly loans: Repository<Loan>,
    private readonly libraryMail: LibraryNotificationsService,
  ) {}

  @Cron('0 8 * * *')
  async runDailyNotices(): Promise<void> {
    await this.sendDueReminders();
    await this.sendOverdueNotices();
  }

  private async sendDueReminders(): Promise<void> {
    const tomorrow = addDaysIso(todayIsoDate(), 1);
    const dueSoon = await this.loans
      .createQueryBuilder('loan')
      .withDeleted()
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.fine', 'fine')
      .where('loan.returned_at IS NULL')
      .andWhere('loan.due_date = :tomorrow', { tomorrow })
      .andWhere('loan.reminder_sent_at IS NULL')
      .getMany();

    for (const loan of dueSoon) {
      try {
        const result = await this.libraryMail.notifyDueReminder(loan);
        if (result === 'sent' || result === 'skipped') {
          await this.loans.update(loan.id, { reminderSentAt: new Date() });
        }
      } catch (err) {
        this.logger.error(
          `Due reminder failed loanId=${loan.id}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }

  private async sendOverdueNotices(): Promise<void> {
    const today = todayIsoDate();
    const overdue = await this.loans
      .createQueryBuilder('loan')
      .withDeleted()
      .leftJoinAndSelect('loan.book', 'book')
      .leftJoinAndSelect('loan.fine', 'fine')
      .where('loan.returned_at IS NULL')
      .andWhere('loan.due_date < :today', { today })
      .andWhere('loan.overdue_notified_at IS NULL')
      .getMany();

    for (const loan of overdue) {
      try {
        const result = await this.libraryMail.notifyOverdue(loan);
        if (result === 'sent' || result === 'skipped') {
          await this.loans.update(loan.id, { overdueNotifiedAt: new Date() });
        }
      } catch (err) {
        this.logger.error(
          `Overdue notice failed loanId=${loan.id}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }
}
