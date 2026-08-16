import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovementEntity, MovementType } from '../entities/StockMovementEntity';

export interface MovementFilterOptions {
  warehouseId?: string;
  productId?: string;
  sku?: string;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class StockMovementRepository {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly repo: Repository<StockMovementEntity>,
  ) {}

  async create(data: {
    warehouseId: string;
    sourceWarehouseId?: string;
    productId: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    userId: string;
  }): Promise<StockMovementEntity> {
    const movement = this.repo.create(data);
    return this.repo.save(movement);
  }

  async findWithFilters(filters: MovementFilterOptions): Promise<StockMovementEntity[]> {
    const qb = this.repo
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .leftJoinAndSelect('movement.sourceWarehouse', 'sourceWarehouse')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.user', 'user')
      .orderBy('movement.createdAt', 'DESC');

    if (filters.warehouseId) {
      qb.andWhere('movement.warehouseId = :warehouseId', {
        warehouseId: filters.warehouseId,
      });
    }

    if (filters.productId) {
      qb.andWhere('movement.productId = :productId', { productId: filters.productId });
    }

    if (filters.sku) {
      qb.andWhere('product.sku = :sku', { sku: filters.sku.toUpperCase() });
    }

    if (filters.type) {
      qb.andWhere('movement.type = :type', { type: filters.type });
    }

    if (filters.dateFrom) {
      qb.andWhere('movement.createdAt >= :dateFrom', {
        dateFrom: new Date(filters.dateFrom),
      });
    }

    if (filters.dateTo) {
      qb.andWhere('movement.createdAt <= :dateTo', { dateTo: new Date(filters.dateTo) });
    }

    return qb.getMany();
  }
}
