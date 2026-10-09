import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { LessonProgress } from './lesson-progress.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CreateLessonProgressDto } from './dto/create-lesson-progress.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Injectable()
export class LessonProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(dto: CreateLessonProgressDto, user: JwtUser) {
    const lesson = await this.lessonRepository.findOne({
      where: { id: dto.lessonId },
      relations: ['course'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.enrollmentRepository.findOne({
      where: { courseId: lesson.courseId, studentId: user.id },
    });
    if (!enrollment) {
      throw new ForbiddenException('Student must be enrolled to track lesson progress');
    }

    const progress = this.lessonProgressRepository.create({
      lessonId: dto.lessonId,
      studentId: user.id,
      completed: dto.completed,
      completedAt: dto.completed ? new Date() : null,
    });

    try {
      return await this.lessonProgressRepository.save(progress);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        // Update existing progress
        const existing = await this.lessonProgressRepository.findOne({
          where: { lessonId: dto.lessonId, studentId: user.id },
        });
        if (existing) {
          existing.completed = dto.completed;
          existing.completedAt = dto.completed ? new Date() : null;
          return await this.lessonProgressRepository.save(existing);
        }
      }
      throw error;
    }
  }

  async findByStudentAndCourse(studentId: string, courseId: string) {
    return this.lessonProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.lesson', 'lesson')
      .where('progress.studentId = :studentId', { studentId })
      .andWhere('lesson.courseId = :courseId', { courseId })
      .orderBy('lesson.position', 'ASC')
      .getMany();
  }

  async findByStudent(studentId: string) {
    return this.lessonProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.lesson', 'lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .where('progress.studentId = :studentId', { studentId })
      .orderBy('lesson.position', 'ASC')
      .getMany();
  }
}
