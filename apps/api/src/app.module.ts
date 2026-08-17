import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { CoachModule } from './modules/coach';
import { GoalsModule } from './modules/goals';
import { HealthModule } from './modules/health';
import { PersonalRecordsModule } from './modules/personal-records';
import { PlansModule } from './modules/plans';
import { WorkoutsModule } from './modules/workouts';

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
    CoachModule,
    GoalsModule,
    HealthModule,
    PersonalRecordsModule,
    PlansModule,
    WorkoutsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
