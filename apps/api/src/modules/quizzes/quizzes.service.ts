import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { Question } from './question.entity';
import { Course } from '../courses/course.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(courseId?: string) {
    const qb = this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoinAndSelect('quiz.questions', 'question');
    if (courseId) {
      qb.where('quiz.courseId = :courseId', { courseId });
    }
    return qb.orderBy('question.position', 'ASC').getMany();
  }

  async findOne(id: string) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions'],
      order: { questions: { position: 'ASC' } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async create(dto: CreateQuizDto, user: JwtUser) {
    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to create quiz for this course');
    }

    const quiz = this.quizRepository.create({
      courseId: dto.courseId,
      title: dto.title,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      questions: dto.questions.map((question) => ({
        type: question.type,
        prompt: question.prompt,
        correctAnswer: question.correctAnswer,
        choices: question.choices,
        position: question.position,
      })),
    });

    if (quiz.questions.length === 0) {
      throw new BadRequestException('Quiz must contain at least one question');
    }

    return this.dataSource.transaction(async (manager) => {
      return manager.save(quiz);
    });
  }

  async update(id: string, dto: UpdateQuizDto, user: JwtUser) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['course', 'questions'],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to update this quiz');
    }

    if (dto.title !== undefined) quiz.title = dto.title;
    if (dto.dueAt !== undefined) quiz.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;

    return this.dataSource.transaction(async (manager) => {
      if (dto.questions) {
        if (dto.questions.length === 0) {
          throw new BadRequestException('Quiz must contain at least one question');
        }
        await manager.delete('questions', { quizId: quiz.id });

        quiz.questions = dto.questions.map((question) =>
          manager.create(Question, {
            quizId: quiz.id,
            type: question.type,
            prompt: question.prompt,
            correctAnswer: question.correctAnswer,
            choices: question.choices,
            position: question.position,
          }),
        );
      }
      return manager.save(quiz);
    });
  }

  async remove(id: string, user: JwtUser) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['course'],
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.course.instructorId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized to delete this quiz');
    }

    await this.quizRepository.delete(id);
    return { ok: true };
  }
}
