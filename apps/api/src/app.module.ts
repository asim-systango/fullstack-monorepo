import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';

const db = databaseConfig();

/**
 * Internal domain API — Bearer JWT only (cookie auth lives on api-gateway).
 * Add your domain modules here (do not put product CRUD in Next).
 * Entities registered via TypeOrmModule.forFeature are auto-loaded.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...db,
    }),
    AuthModule,
    HealthModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
