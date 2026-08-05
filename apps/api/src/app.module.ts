import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { ProjectsModule } from './modules/projects/projects.module';
import { IssuesModule } from './modules/issues/issues.module';
import { LabelsModule } from './modules/labels/labels.module';

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
    ProjectsModule,
    IssuesModule,
    LabelsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
