import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, QueryFailedError, Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Course } from '../courses/course.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(dto: CreateEnrollmentDto, user: JwtUser) {
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId, publishedAt: Not(IsNull()), deletedAt: IsNull() },
    });
    if (!course) {
      throw new NotFoundException('Course not available for enrollment');
    }
    if (course.instructorId === user.id) {
      throw new ForbiddenException('Instructors cannot enroll in their own course');
    }

    const enrollment = this.enrollmentRepository.create({
      courseId: dto.courseId,
      studentId: user.id,
    });

    try {
      return await this.enrollmentRepository.save(enrollment);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Already enrolled in this course');
      }
      throw error;
    }
  }

  async findAll(user: JwtUser, courseId?: string) {
    const qb = this.enrollmentRepository.createQueryBuilder('enrollment');

    if (user.role === 'admin') {
      if (courseId) {
        qb.where('enrollment.courseId = :courseId', { courseId });
      }
    } else if (user.role === 'staff') {
      if (courseId) {
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) {
          throw new NotFoundException('Course not found');
        }
        if (course.instructorId !== user.id) {
          throw new ForbiddenException(
            'Not authorized to view enrollments for this course',
          );
        }
        qb.where('enrollment.courseId = :courseId', { courseId });
      } else {
        const courseIds = await this.courseRepository
          .createQueryBuilder('course')
          .select('course.id', 'id')
          .where('course.instructorId = :instructorId', { instructorId: user.id })
          .andWhere('course.deletedAt IS NULL')
          .getRawMany();

        const ids = courseIds.map((row) => row.id);
        if (ids.length === 0) {
          return [];
        }
        qb.where('enrollment.courseId IN (:...ids)', { ids });
      }
    } else {
      qb.where('enrollment.studentId = :studentId', { studentId: user.id });
    }

    return qb.orderBy('enrollment.enrolledAt', 'DESC').getMany();
  }

  async findAllAdmin() {
    return this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .orderBy('enrollment.enrolledAt', 'DESC')
      .getMany();
  }
}
