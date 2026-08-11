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
}
