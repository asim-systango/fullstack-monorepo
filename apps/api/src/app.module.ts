import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './common/auth';
import { databaseConfig } from './config';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { GradesModule } from './modules/grades/grades.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { LessonProgressModule } from './modules/lesson-progress/lesson-progress.module';

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
    CoursesModule,
    LessonsModule,
    EnrollmentsModule,
    QuizzesModule,
    SubmissionsModule,
    GradesModule,
    CertificatesModule,
    LessonProgressModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
