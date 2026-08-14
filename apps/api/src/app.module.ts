import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './modules/mail/mail.module';
import { OrganizationModule } from './modules/organizations/organization.module';
import { AuthModule } from './modules/auth/auth.module';
import { FormsModule } from './modules/forms/forms.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { LeadsModule } from './modules/leads/leads.module';
import { DealsModule } from './modules/deals/deals.module';

/**
 * Internal domain API — DatabaseModule, MailModule, OrganizationModule, AuthModule, FormsModule, DashboardModule.
 */
@Module({
  imports: [
    DatabaseModule,
    MailModule,
    OrganizationModule,
    AuthModule,
    FormsModule,
    DashboardModule,
    UsersModule,
    ContactsModule,
    LeadsModule,
    DealsModule,
  ],
})
export class AppModule {}
