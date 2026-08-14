import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDTO } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepo: Repository<Company>,
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
    return this.companiesRepo.save(company);
  }
}
