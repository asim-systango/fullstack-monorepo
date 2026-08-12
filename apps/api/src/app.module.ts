import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { OrganizationModule } from './modules/organizations/organization.module';
import { AuthModule } from './modules/auth/auth.module';
import { FormsModule } from './modules/forms/forms.module';

/**
 * Internal domain API — DatabaseModule, MailModule, OrganizationModule, AuthModule, FormsModule.
 */
@Module({
  imports: [DatabaseModule, MailModule, OrganizationModule, AuthModule, FormsModule],
})
export class AppModule {}
