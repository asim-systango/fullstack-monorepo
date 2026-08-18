import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { Course } from './course.entity';
import { Submission } from '../submissions/submission.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
  ) {}

  async findPublished(search?: string) {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      // .leftJoinAndSelect('course.lessons', 'lesson')
      .where('course.publishedAt IS NOT NULL')
      .andWhere('course.deletedAt IS NULL');
    // .orderBy('lesson.position', 'ASC');

    if (search) {
      qb.andWhere(
        '(course.title ILIKE :q OR course.description ILIKE :q OR course.slug ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    return qb.getMany();
  }

  async findPublishedById(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['lessons'],
      order: { lessons: { position: 'ASC' } },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async findAllAdmin(search?: string) {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.lessons', 'lesson');

    if (search) {
      qb.where(
        '(course.title ILIKE :q OR course.description ILIKE :q OR course.slug ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    return qb
      .orderBy('course.createdAt', 'DESC')
      .addOrderBy('lesson.position', 'ASC')
      .getMany();
  }

  async findInstructorCourses(instructorId: string, search?: string) {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.lessons', 'lesson')
      .leftJoinAndSelect('course.quizzes', 'quiz')
      .where('course.instructorId = :instructorId', { instructorId })
      .andWhere('course.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(course.title ILIKE :q OR course.description ILIKE :q OR course.slug ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    return qb
      .orderBy('course.createdAt', 'DESC')
      .addOrderBy('lesson.position', 'ASC')
      .getMany();
  }

  async findById(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async create(dto: CreateCourseDto, instructor: JwtUser) {
    const course = this.courseRepository.create({
      ...dto,
      instructorId: instructor.id,
    });

    try {
      return await this.courseRepository.save(course);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Course slug already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCourseDto, user: JwtUser) {
    const course = await this.findById(id);
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to update this course');
    }

    if (dto.title !== undefined) course.title = dto.title;
    if (dto.slug !== undefined) course.slug = dto.slug;
    if (dto.description !== undefined) course.description = dto.description;

    try {
      return await this.courseRepository.save(course);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Course slug already exists');
      }
      throw error;
    }
  }

  async publish(id: string, user: JwtUser) {
    const course = await this.findById(id);
    if (course.deletedAt) {
      throw new NotFoundException('Course not found');
    }
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to publish this course');
    }
    course.publishedAt = new Date();
    return this.courseRepository.save(course);
  }

  async unpublish(id: string, user: JwtUser) {
    const course = await this.findById(id);
    if (course.deletedAt) {
      throw new NotFoundException('Course not found');
    }
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to unpublish this course');
    }
    course.publishedAt = null;
    return this.courseRepository.save(course);
  }

  async findInstructorDashboard(user: JwtUser, instructorId?: string) {
    const targetInstructorId =
      user.role === 'admin' && instructorId ? instructorId : user.id;

    // Total ungraded submissions for instructor's courses
    const total = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoin('submission.grade', 'grade')
      .leftJoin('submission.quiz', 'quiz')
      .leftJoin('quiz.course', 'course')
      .where('course.instructorId = :instructorId', { instructorId: targetInstructorId })
      .andWhere('grade.id IS NULL')
      .andWhere('course.deletedAt IS NULL')
      .getCount();

    // Ungraded counts grouped by course
    const perCourse = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoin('submission.grade', 'grade')
      .leftJoin('submission.quiz', 'quiz')
      .leftJoin('quiz.course', 'course')
      .select('course.id', 'courseId')
      .addSelect('course.title', 'title')
      .addSelect('COUNT(submission.id)', 'ungraded')
      .where('course.instructorId = :instructorId', { instructorId: targetInstructorId })
      .andWhere('grade.id IS NULL')
      .andWhere('course.deletedAt IS NULL')
      .groupBy('course.id')
      .getRawMany();

    return { total, perCourse };
  }

  async softDelete(id: string, user: JwtUser) {
    const course = await this.findById(id);
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to delete this course');
    }
    course.deletedAt = new Date();
    return this.courseRepository.save(course);
  }
}
