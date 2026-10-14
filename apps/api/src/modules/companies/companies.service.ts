import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCompanyDTO } from './dto/create-company.dto';
import { JobsService } from '../jobs/jobs.service';
import { JobStatus } from '../jobs/job-status.enum';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) return false;
  const driverError = (err as { driverError?: { code?: string } }).driverError;
  return driverError?.code === '23505';
}

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
  ) {}

  findByUserId(userId: string) {
    return this.companiesRepo.findOne({ where: { userId } });
  }

  findAll() {
    return this.companiesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByIdOrThrow(id: string) {
    const company = await this.companiesRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async findByUserIdOrThrow(userId: string) {
    const company = await this.findByUserId(userId);
    if (!company) {
      throw new NotFoundException('Create a company profile first');
    }
    return company;
  }

  async create(userId: string, dto: CreateCompanyDTO) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      throw new ConflictException('You already have a company profile');
    }

    try {
      const company = this.companiesRepo.create({ ...dto, userId });
      return await this.companiesRepo.save(company);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('You already have a company profile');
      }
      throw err;
    }
  }

  async suspend(id: string) {
    const company = await this.findByIdOrThrow(id);
    return this.companiesRepo.manager.transaction(async (manager) => {
      company.suspended = true;
      await manager.save(company);

      const jobs = await this.jobsService.findAllForOwner(company.id, manager);
      const openJobs = jobs.filter((job) => job.status === JobStatus.OPEN);
      for (const job of openJobs) {
        await this.jobsService.forceClose(job.id, manager);
      }

      return company;
    });
  }

  async reactivate(id: string) {
    const company = await this.findByIdOrThrow(id);
    company.suspended = false;
    return this.companiesRepo.save(company);
  }
}
