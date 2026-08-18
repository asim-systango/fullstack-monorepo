import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { LessonProgressService } from './lesson-progress.service';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Controller('lesson-progress')
@UseGuards(JwtAuthGuard)
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  @Post()
  create(@Body() dto: CreateLessonProgressDto, @Request() req: { user: JwtUser }) {
    return this.lessonProgressService.create(dto, req.user);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string, @Request() req: { user: JwtUser }) {
    return this.lessonProgressService.findByStudentAndCourse(req.user.id, courseId);
  }

  @Get()
  findByStudent(@Request() req: { user: JwtUser }) {
    return this.lessonProgressService.findByStudent(req.user.id);
  }
}
