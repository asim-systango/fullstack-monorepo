import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Lead } from '../entities/lead.entity';

@Injectable()
export class LeadRepository extends Repository<Lead> {
  constructor(private dataSource: DataSource) {
    super(Lead, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Lead | null> {
    return this.findOne({ where: { id } });
  }

  async findDetailsById(id: string): Promise<Lead | null> {
    return this.findOne({
      where: { id },
      relations: ['contact', 'owner'],
    });
  }

  async findLeads(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      stage?: string;
      source?: string;
      ownerId?: string;
    },
  ): Promise<{ data: Lead[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.contact', 'contact')
      .leftJoinAndSelect('lead.owner', 'owner')
      .where('lead.organizationId = :organizationId', { organizationId });

    if (options.stage) {
      queryBuilder.andWhere('lead.stage = :stage', { stage: options.stage });
    }

    if (options.source) {
      queryBuilder.andWhere('lead.source = :source', { source: options.source });
    }

    if (options.ownerId) {
      queryBuilder.andWhere('lead.ownerId = :ownerId', { ownerId: options.ownerId });
    }

    if (options.search) {
      queryBuilder.andWhere(
        '(LOWER(lead.title) LIKE LOWER(:search) OR LOWER(contact.firstName) LIKE LOWER(:search) OR LOWER(contact.lastName) LIKE LOWER(:search) OR LOWER(contact.email) LIKE LOWER(:search))',
        { search: `%${options.search}%` },
      );
    }

    queryBuilder
      .orderBy('lead.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    return { data, total, page, limit, totalPages };
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    await this.update(id, { ...data, updatedAt: Date.now() });
  }
}
