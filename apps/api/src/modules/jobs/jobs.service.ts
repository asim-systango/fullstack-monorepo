import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApplicationsService } from '../applications/applications.service';
import { CompaniesService } from '../companies/companies.service';
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
    private readonly companiesService: CompaniesService,
    private readonly dataSource: DataSource,
    // forwardRef: Applications.create needs JobsService; close needs ApplicationsService.
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
    if (!job || job.company.suspended) {
      throw new NotFoundException('Job not found');
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
      withDeleted: true, // owner can see their own history, including soft-deleted
    });
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
    await this.findOwnedByUser(id, userId); // throws if not found / not owner
    await this.jobsRepo.softDelete(id);
    return { ok: true };
  }

  async findOpenOrThrow(id: string) {
    const job = await this.findOnePublic(id); // throws 404 if missing/soft-deleted/suspended
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('This job is not accepting applications');
    }
    return job;
  }

  async closeOwned(id: string, userId: string) {
    const job = await this.findOwnedByUser(id, userId);
    return this.closeJobInTransaction(job);
  }

  // Admin force-close: same transactional write, no ownership check.
  async forceClose(id: string) {
    const job = await this.jobsRepo.findOne({ where: { id }, relations: ['company'] });
    if (!job) throw new NotFoundException('Job not found');
    return this.closeJobInTransaction(job);
  }

  private async closeJobInTransaction(job: Job) {
    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestException('Job is already closed');
    }

    // Real transaction so job.status + application rejects commit or roll back together.
    return this.dataSource.transaction(async (manager) => {
      job.status = JobStatus.CLOSED;
      const closed = await manager.save(job);
      await this.applicationsService.rejectOpenForJob(job.id, manager);
      return closed;
    });
  }

  countOpenForCompany(companyId: string) {
    return this.jobsRepo.count({
      where: { companyId, status: JobStatus.OPEN },
    });
  }
}
