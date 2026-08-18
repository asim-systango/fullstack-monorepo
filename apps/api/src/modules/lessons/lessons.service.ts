import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Course } from '../courses/course.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(dto: CreateLessonDto, user: JwtUser) {
    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('No access to add lessons to this course');
    }

    const lesson = this.lessonRepository.create(dto);
    try {
      return await this.lessonRepository.save(lesson);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Lesson position must be unique for this course');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateLessonDto, user: JwtUser) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const course = await this.courseRepository.findOne({
      where: { id: lesson.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('No access to update this lesson');
    }

    Object.assign(lesson, dto);
    try {
      return await this.lessonRepository.save(lesson);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Lesson position must be unique for this course');
      }
      throw error;
    }
  }

  async remove(id: string, user: JwtUser) {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const course = await this.courseRepository.findOne({
      where: { id: lesson.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('No access to remove this lesson');
    }
    await this.lessonRepository.delete(id);
    return { ok: true };
  }
}
