import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompaniesService } from '../companies/companies.service';
import { ApplicationsService } from '../applications/applications.service';
import { Job } from './job.entity';
import { JobStatus } from './job-status.enum';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ListJobsQueryDto } from './dto/list-jobs-query.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepo: Repository<Job>,
    // forwardRef: Companies needs JobsService (close jobs on suspend), Jobs needs
    // CompaniesService (owner lookup) — genuine circular dependency.
    @Inject(forwardRef(() => CompaniesService))
    private readonly companiesService: CompaniesService,
    // forwardRef: Applications needs JobsService (check open status), Jobs needs
    // ApplicationsService (bulk-reject on close) — genuine circular dependency.
    @Inject(forwardRef(() => ApplicationsService))
    private readonly applicationsService: ApplicationsService,
  ) {}

  async findAllPublic(query: ListJobsQueryDto) {
    const { page, limit, title, location } = query;

    // Exclude suspended companies so admin suspension immediately hides their public listings.
    const qb = this.jobsRepo
      .createQueryBuilder('job')
      .innerJoinAndSelect('job.company', 'company')
      .where('company.suspended = false');

    if (title) {
      qb.andWhere('job.title ILIKE :title', { title: `%${title}%` });
    }
    if (location) {
      qb.andWhere('job.location ILIKE :location', { location: `%${location}%` });
    }

    qb.orderBy('job.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, page, limit, total };
  }

  async findOnePublic(id: string) {
    const job = await this.jobsRepo.findOne({ where: { id }, relations: ['company'] });
    // Match findAllPublic: suspended company jobs are hidden from public/candidate reads.
    if (!job || job.company.suspended) throw new NotFoundException('Job not found');
    return job;
  }

  async findOpenOrThrow(id: string) {
    const job = await this.findOnePublic(id);
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('This job is not accepting applications');
    }
    return job;
  }

  async findOwnedByUser(id: string, userId: string) {
    const job = await this.jobsRepo.findOne({ where: { id }, relations: ['company'] });
    if (!job) throw new NotFoundException('Job not found');
    if (job.company.userId !== userId) {
      throw new ForbiddenException('You do not own this job');
    }
    return job;
  }

  findAllForOwner(companyId: string) {
    return this.jobsRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      withDeleted: true,
    });
  }

  async countOpenForOwner(companyId: string) {
    return this.jobsRepo.count({ where: { companyId, status: JobStatus.OPEN } });
  }

  async create(userId: string, dto: CreateJobDto) {
    const company = await this.companiesService.findByUserIdOrThrow(userId);
    const job = this.jobsRepo.create({
      ...dto,
      companyId: company.id,
      status: JobStatus.OPEN,
    });
    return this.jobsRepo.save(job);
  }

  async update(id: string, userId: string, dto: UpdateJobDto) {
    const job = await this.findOwnedByUser(id, userId);
    Object.assign(job, dto);
    return this.jobsRepo.save(job);
  }

  async remove(id: string, userId: string) {
    await this.findOwnedByUser(id, userId);
    await this.jobsRepo.softDelete(id);
    return { ok: true };
  }

  private async runCloseTransaction(jobId: string) {
    return this.jobsRepo.manager.transaction(async (manager) => {
      await manager.update(Job, jobId, { status: JobStatus.CLOSED });
      await this.applicationsService.rejectOpenForJob(jobId, manager);
      return manager.findOneOrFail(Job, { where: { id: jobId } });
    });
  }

  async close(id: string, userId: string) {
    await this.findOwnedByUser(id, userId);
    return this.runCloseTransaction(id);
  }

  async forceClose(id: string) {
    // Do not use findOnePublic — admin force-close / company suspend must still
    // reach jobs whose company is already marked suspended, and soft-deleted
    const job = await this.jobsRepo.findOne({ where: { id }, withDeleted: true });
    if (!job) throw new NotFoundException('Job not found');
    return this.jobsRepo.manager.transaction(async (manager) => {
      job.status = JobStatus.CLOSED;
      await manager.save(job);
      await this.applicationsService.rejectOpenForJob(id, manager);
      return job;
    });
  }
}
