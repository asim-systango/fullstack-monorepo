import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { Lesson } from '../lessons/lesson.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Submission } from '../submissions/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lesson, Submission])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
