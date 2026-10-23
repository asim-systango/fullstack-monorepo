import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseEntity } from '../entities/WarehouseEntity';

@Injectable()
export class WarehouseRepository {
  constructor(
    @InjectRepository(WarehouseEntity)
    private readonly repo: Repository<WarehouseEntity>,
  ) {}

  async findAll(): Promise<WarehouseEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<WarehouseEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['stockLevels', 'stockLevels.product'],
    });
  }

  async findByCode(code: string): Promise<WarehouseEntity | null> {
    return this.repo.findOne({ where: { code: code.toUpperCase() } });
  }

  async create(data: {
    code: string;
    name: string;
    location: string;
  }): Promise<WarehouseEntity> {
    const warehouse = this.repo.create({
      code: data.code.toUpperCase(),
      name: data.name,
      location: data.location,
    });
    return this.repo.save(warehouse);
  }

  async update(
    id: string,
    data: Partial<Pick<WarehouseEntity, 'name' | 'location'>>,
  ): Promise<WarehouseEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
