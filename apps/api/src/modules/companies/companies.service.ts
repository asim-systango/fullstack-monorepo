import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDTO } from './dto/create-company.dto';
import { JobsService } from '../jobs/jobs.service';

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

    const company = this.companiesRepo.create({ ...dto, userId });
    return this.companiesRepo.save(company);
  }

  async suspend(id: string) {
    const company = await this.findByIdOrThrow(id);
    company.suspended = true;
    await this.companiesRepo.save(company);

    // Force-close every open job this company has, per the doc's suspend behavior.
    const jobs = await this.jobsService.findAllForOwner(company.id);
    const openJobs = jobs.filter((job) => job.status === 'open');
    for (const job of openJobs) {
      await this.jobsService.forceClose(job.id);
    }

    return company;
  }

  async reactivate(id: string) {
    const company = await this.findByIdOrThrow(id);
    company.suspended = false;
    return this.companiesRepo.save(company);
  }
}
