import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationStatus } from '../entities/organization.entity';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  getRepo(): Repository<Organization> {
    return this.orgRepo;
  }

  async findById(id: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { slug } });
  }

  async findByPrimaryDomain(domain: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { primaryDomain: domain } });
  }

  async findAll(): Promise<Organization[]> {
    return this.orgRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createAndSave(data: Partial<Organization>): Promise<Organization> {
    const org = this.orgRepo.create(data);
    return this.orgRepo.save(org);
  }

  async updateOrg(id: string, data: Partial<Organization>): Promise<void> {
    await this.orgRepo.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  }

  async updateStatus(id: string, status: OrganizationStatus): Promise<void> {
    await this.orgRepo.update(id, {
      status,
      updatedAt: Date.now(),
    });
  }
}
