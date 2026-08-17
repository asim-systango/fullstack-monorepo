import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Deal } from '../entities/deal.entity';

@Injectable()
export class DealRepository extends Repository<Deal> {
  constructor(private dataSource: DataSource) {
    super(Deal, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Deal | null> {
    return this.findOne({ where: { id } });
  }

  async findDetailsById(id: string): Promise<Deal | null> {
    return this.findOne({
      where: { id },
      relations: ['lead', 'contact', 'owner', 'creator'],
    });
  }

  async findDeals(
    organizationId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      stage?: string;
      ownerId?: string;
    },
  ): Promise<{ data: Deal[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createQueryBuilder('deal')
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.contact', 'contact')
      .leftJoinAndSelect('deal.owner', 'owner')
      .where('deal.organizationId = :organizationId', { organizationId });

    if (options.stage) {
      queryBuilder.andWhere('deal.stage = :stage', { stage: options.stage });
    }

    if (options.ownerId) {
      queryBuilder.andWhere('deal.ownerId = :ownerId', { ownerId: options.ownerId });
    }

    if (options.search) {
      queryBuilder.andWhere(
        '(LOWER(deal.title) LIKE LOWER(:search) OR LOWER(contact.firstName) LIKE LOWER(:search) OR LOWER(contact.lastName) LIKE LOWER(:search) OR LOWER(contact.email) LIKE LOWER(:search))',
        { search: `%${options.search}%` },
      );
    }

    queryBuilder
      .orderBy('deal.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit) || 1;

    return { data, total, page, limit, totalPages };
  }

  async findAllDeals(organizationId: string, ownerId?: string): Promise<Deal[]> {
    const query = this.createQueryBuilder('deal')
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.contact', 'contact')
      .leftJoinAndSelect('deal.owner', 'owner')
      .where('deal.organizationId = :organizationId', { organizationId });

    if (ownerId) {
      query.andWhere('deal.ownerId = :ownerId', { ownerId });
    }

    return query.orderBy('deal.createdAt', 'DESC').getMany();
  }

  async updateDeal(id: string, data: Partial<Deal>): Promise<void> {
    await this.update(id, { ...data, updatedAt: Date.now() });
  }
}
