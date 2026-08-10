import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { OrganizationModule } from './modules/organizations/organization.module';

/**
 * Internal domain API — DatabaseModule, MailModule, and OrganizationModule.
 */
@Module({
  imports: [DatabaseModule, MailModule, OrganizationModule],
})
export class AppModule {}
