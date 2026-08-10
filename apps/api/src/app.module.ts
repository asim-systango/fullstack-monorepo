import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { OrganizationModule } from './modules/organizations/organization.module';
import { AuthModule } from './modules/auth/auth.module';

/**
 * Internal domain API — DatabaseModule, MailModule, OrganizationModule, AuthModule.
 */
@Module({
  imports: [DatabaseModule, MailModule, OrganizationModule, AuthModule],
})
export class AppModule {}
