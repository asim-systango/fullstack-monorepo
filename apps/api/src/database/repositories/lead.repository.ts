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
      relations: ['contact'],
    });
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    await this.update(id, { ...data, updatedAt: Date.now() });
  }
}
