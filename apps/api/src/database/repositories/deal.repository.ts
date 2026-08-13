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
}
