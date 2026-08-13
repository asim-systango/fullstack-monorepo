import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
  ) {}

  async findAllPublic(query: ListJobsQueryDto) {
    const { page, limit, title, location } = query;

    const [data, total] = await this.jobsRepo.findAndCount({
      where: {
        ...(title && { title: ILike(`%${title}%`) }),
        ...(location && { location: ILike(`%${location}%`) }),
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, page, limit, total };
  }

  async findOnePublic(id: string) {
    const job = await this.jobsRepo.findOne({ where: { id }, relations: ['company'] });
    if (!job) throw new NotFoundException('Job not found');
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
    const job = await this.findOnePublic(id); // throws 404 if missing/soft-deleted
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('This job is not accepting applications');
    }
    return job;
  }
}
