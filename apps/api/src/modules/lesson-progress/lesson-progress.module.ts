import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgressController } from './lesson-progress.controller';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgress } from './lesson-progress.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Enrollment } from '../enrollments/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonProgress, Lesson, Enrollment])],
  controllers: [LessonProgressController],
  providers: [LessonProgressService],
  exports: [LessonProgressService],
})
export class LessonProgressModule {}
