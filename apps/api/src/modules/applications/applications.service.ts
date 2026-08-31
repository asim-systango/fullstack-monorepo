import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { JobsService } from '../jobs/jobs.service';
import { ResumeMetaService } from '../resume-meta/resume-meta.service';
import { Application } from './application.entity';
import { ALLOWED_TRANSITIONS, ApplicationStatus } from './application-status.enum';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-status.dto';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = (err as { driverError?: { code?: string } }).driverError;
  return driverError?.code === '23505';
}

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepo: Repository<Application>,
    // forwardRef: JobsService.close needs ApplicationsService, and create needs JobsService.
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
    private readonly resumeMetaService: ResumeMetaService,
  ) {}

  async create(candidateUserId: string, jobId: string, dto: CreateApplicationDto) {
    await this.jobsService.findOpenOrThrow(jobId); // 404 if missing, 400 if closed/suspended

    const existing = await this.applicationsRepo.findOne({ where: { jobId, candidateUserId } });
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    // Snapshot pattern: copy resume URL at apply-time so later ResumeMeta edits don't rewrite history.
    let resumeUrl = dto.resumeUrl;
    if (dto.resumeMetaId) {
      const resume = await this.resumeMetaService.findOwnedOrThrow(dto.resumeMetaId, candidateUserId);
      resumeUrl = resume.url;
    }

    try {
      const application = this.applicationsRepo.create({
        jobId,
        candidateUserId,
        status: ApplicationStatus.SUBMITTED,
        coverLetter: dto.coverLetter,
        resumeUrl,
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

  // Bulk reject for job-close transaction — set-based WHERE, not per-row branching.
  async rejectOpenForJob(jobId: string, manager: EntityManager) {
    await manager
      .createQueryBuilder()
      .update(Application)
      .set({ status: ApplicationStatus.REJECTED })
      .where('job_id = :jobId', { jobId })
      .andWhere('status NOT IN (:...terminal)', {
        terminal: [ApplicationStatus.REJECTED, ApplicationStatus.HIRED],
      })
      .execute();
  }

  async summaryForCandidate(candidateUserId: string) {
    const rows = await this.applicationsRepo
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('application.candidate_user_id = :candidateUserId', { candidateUserId })
      .groupBy('application.status')
      .getRawMany<{ status: ApplicationStatus; count: string }>();

    return {
      byStatus: Object.fromEntries(
        rows.map((row) => [row.status, Number(row.count)]),
      ) as Partial<Record<ApplicationStatus, number>>,
    };
  }

  async summaryForCompany(companyId: string) {
    const rows = await this.applicationsRepo
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('job.company_id = :companyId', { companyId })
      .groupBy('application.status')
      .getRawMany<{ status: ApplicationStatus; count: string }>();

    return Object.fromEntries(
      rows.map((row) => [row.status, Number(row.count)]),
    ) as Partial<Record<ApplicationStatus, number>>;
  }
}
