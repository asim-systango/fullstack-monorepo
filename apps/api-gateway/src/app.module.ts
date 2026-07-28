import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { databaseConfig } from './config/database.config';
import { JwtAuthGuard, RolesGuard } from './common/auth/auth.decorators';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';

const db = databaseConfig();

/**
 * Browser-facing BFF — cookie JWT auth, users, health.
 * Domain CRUD lives in apps/api and is reached via the reverse proxy in main.ts.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...db,
    }),
    UsersModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
