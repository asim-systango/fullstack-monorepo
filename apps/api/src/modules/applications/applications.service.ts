import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { JobsService } from '../jobs/jobs.service';
import { Application } from './application.entity';
import { ALLOWED_TRANSITIONS, ApplicationStatus } from './application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-status.dto';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = (err as any).driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepo: Repository<Application>,
    private readonly jobsService: JobsService,
  ) {}

  async create(candidateUserId: string, jobId: string, dto: CreateApplicationDto) {
    await this.jobsService.findOpenOrThrow(jobId); // 404 if missing, 400 if closed

    const existing = await this.applicationsRepo.findOne({ where: { jobId, candidateUserId } });
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    try {
      const application = this.applicationsRepo.create({
        jobId,
        candidateUserId,
        status: ApplicationStatus.SUBMITTED,
        ...dto,
      });
      return await this.applicationsRepo.save(application);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('You have already applied to this job');
      }
      throw err;
    }
  }

  findMine(candidateUserId: string) {
    return this.applicationsRepo.find({
      where: { candidateUserId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
    });
  }

  async findForOwner(userId: string, status?: ApplicationStatus) {
    const qb = this.applicationsRepo
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.job', 'job')
      .innerJoin('job.company', 'company')
      .where('company.userId = :userId', { userId })
      .orderBy('application.createdAt', 'DESC');

    if (status) {
      qb.andWhere('application.status = :status', { status });
    }

    return qb.getMany();
  }

  async findOneOwnedByStaff(id: string, userId: string) {
    const application = await this.applicationsRepo.findOne({
      where: { id },
      relations: ['job', 'job.company'],
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.job.company.userId !== userId) {
      throw new ForbiddenException('You do not own this application');
    }
    return application;
  }

  async updateStatus(id: string, userId: string, dto: UpdateApplicationStatusDto) {
    const application = await this.findOneOwnedByStaff(id, userId);

    const allowedNext = ALLOWED_TRANSITIONS[application.status];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot move from '${application.status}' to '${dto.status}'`,
      );
    }

    application.status = dto.status;
    return this.applicationsRepo.save(application);
  }
}