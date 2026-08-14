import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { BalancesModule } from './modules/balances/balances.module';
import { ExpensesModule } from './modules/expenses';
import { GroupsModule } from './modules/groups';
import { HealthModule } from './modules/health';
import { MailModule } from './modules/mail';

const db = databaseConfig();

/**
 * Splitter domain API — auth, mail, and expense modules live here.
 * Entities registered via TypeOrmModule.forFeature are auto-loaded.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...db,
    }),
    MailModule,
    AuthModule,
    GroupsModule,
    ExpensesModule,
    BalancesModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
