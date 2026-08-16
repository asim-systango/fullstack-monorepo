import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../entities/CategoryEntity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repo: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<CategoryEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  async create(name: string): Promise<CategoryEntity> {
    const category = this.repo.create({ name });
    return this.repo.save(category);
  }

  async update(id: string, name: string): Promise<CategoryEntity | null> {
    await this.repo.update(id, { name });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
