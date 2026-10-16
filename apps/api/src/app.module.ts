import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard, MustChangePasswordGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { BooksModule } from './modules/books';
import { DashboardModule } from './modules/dashboard';
import { FinesModule } from './modules/fines';
import { HealthModule } from './modules/health';
import { CheckoutRequestsModule } from './modules/checkout-requests';
import { LoansModule } from './modules/loans';
import { MembersModule } from './modules/members';
import { ReservationsModule } from './modules/reservations';
import { SettingsModule } from './modules/settings';
import { UsersModule } from './modules/users';

const db = databaseConfig();

/**
 * Unified Nest API — auth (cookies + Bearer) and domain modules in one process.
 * Browser talks here directly; api-gateway is not required.
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRoot({
      ...db,
    }),
    UsersModule,
    AuthModule,
    HealthModule,
    MembersModule,
    BooksModule,
    DashboardModule,
    LoansModule,
    CheckoutRequestsModule,
    ReservationsModule,
    FinesModule,
    SettingsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: MustChangePasswordGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
