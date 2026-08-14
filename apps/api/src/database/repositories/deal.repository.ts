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

  async findAllDeals(organizationId: string, ownerId?: string): Promise<Deal[]> {
    const query = this.createQueryBuilder('deal')
      .leftJoinAndSelect('deal.lead', 'lead')
      .leftJoinAndSelect('deal.contact', 'contact')
      .where('deal.organizationId = :organizationId', { organizationId });

    if (ownerId) {
      query.andWhere('deal.ownerId = :ownerId', { ownerId });
    }

    return query.orderBy('deal.createdAt', 'DESC').getMany();
  }
}
