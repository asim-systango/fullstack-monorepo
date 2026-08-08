import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProductEntity } from '../entities/ProductEntity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
  ) {}

  async findAll(includeDeleted = false, categoryId?: string): Promise<ProductEntity[]> {
    const where: FindOptionsWhere<ProductEntity> = {};
    if (!includeDeleted) {
      where.isDeleted = false;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.repo.find({
      where,
      relations: ['category', 'stockLevels', 'stockLevels.warehouse'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['category', 'stockLevels', 'stockLevels.warehouse'],
    });
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    return this.repo.findOne({ where: { sku: sku.toUpperCase() } });
  }

  async create(data: {
    sku: string;
    name: string;
    categoryId: string;
    description?: string;
    unit?: string;
  }): Promise<ProductEntity> {
    const product = this.repo.create({
      sku: data.sku.toUpperCase(),
      name: data.name,
      categoryId: data.categoryId,
      description: data.description,
      unit: data.unit ?? 'pcs',
    });
    return this.repo.save(product);
  }

  async update(
    id: string,
    data: Partial<Pick<ProductEntity, 'name' | 'description' | 'unit' | 'categoryId'>>,
  ): Promise<ProductEntity | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id, { isDeleted: true });
  }
}
