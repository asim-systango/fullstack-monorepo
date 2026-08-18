import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Grade } from './grade.entity';
import { Submission } from '../submissions/submission.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Certificate } from '../certificates/certificate.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { JwtUser } from '../../common/auth/jwt-user';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateGradeDto, user: JwtUser) {
    if (user.role !== 'staff' && user.role !== 'admin') {
      throw new ForbiddenException('Only instructors can grade submissions');
    }

    const submission = await this.submissionRepository.findOne({
      where: { id: dto.submissionId },
      relations: ['quiz'],
    });
    if (!submission) throw new NotFoundException('Submission not found');

    return this.dataSource.transaction(async (manager) => {
      const enrollment = await manager.findOne(Enrollment, {
        where: { courseId: submission.quiz.courseId, studentId: submission.studentId },
      });
      if (!enrollment) {
        throw new BadRequestException('Student enrollment not found for this submission');
      }

      const grade = manager.create(Grade, {
        submissionId: dto.submissionId,
        graderId: user.id,
        score: dto.score,
        feedback: dto.feedback,
      });

      const savedGrade = await manager.save(grade);
      if (dto.score >= 70) {
        const certificateRepo = manager.getRepository(Certificate);
        const existing = await certificateRepo.findOneBy({ enrollmentId: enrollment.id });
        if (!existing) {
          const certificate = certificateRepo.create({
            enrollmentId: enrollment.id,
            issuedAt: new Date(),
          });
          await certificateRepo.save(certificate);
        }
      }

      return savedGrade;
    });
  }

  async findByStudent(studentId: string) {
    return this.gradeRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.submission', 'submission')
      .leftJoinAndSelect('submission.quiz', 'quiz')
      .leftJoinAndSelect('quiz.course', 'course')
      .where('submission.studentId = :studentId', { studentId })
      .orderBy('grade.createdAt', 'DESC')
      .getMany();
  }
}
