import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(dto: CreateSubmissionDto, user: JwtUser) {
    const quiz = await this.quizRepository.findOne({
      where: { id: dto.quizId },
      relations: ['questions'],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.dueAt && quiz.dueAt < new Date()) {
      throw new BadRequestException('Quiz due date has passed');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { courseId: quiz.courseId, studentId: user.id },
    });
    if (!enrollment) {
      throw new ForbiddenException('Student must be enrolled to submit this quiz');
    }

    const submission = this.submissionRepository.create({
      quizId: dto.quizId,
      studentId: user.id,
      answers: dto.answers,
    });

    try {
      return await this.submissionRepository.save(submission);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Submission already exists for this quiz');
      }
      throw error;
    }
  }

  async findUngraded(user: JwtUser) {
    const qb = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.quiz', 'quiz')
      .leftJoinAndSelect('quiz.course', 'course')
      .leftJoinAndSelect('submission.grade', 'grade')
      .where('grade.id IS NULL');

    if (user.role === 'staff') {
      qb.andWhere('course.instructorId = :instructorId', { instructorId: user.id });
    }

    return qb.orderBy('submission.submittedAt', 'ASC').getMany();
  }
}
