import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  StockMovementRepository,
  MovementFilterOptions,
} from '../../database/repositories/StockMovementRepository';
import { StockLevelRepository } from '../../database/repositories/StockLevelRepository';
import { WarehouseRepository } from '../../database/repositories/WarehouseRepository';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import {
  StockMovementEntity,
  MovementType,
} from '../../database/entities/StockMovementEntity';

@Injectable()
export class MovementsService {
  constructor(
    private readonly movementRepository: StockMovementRepository,
    private readonly stockLevelRepository: StockLevelRepository,
    private readonly warehouseRepository: WarehouseRepository,
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getMovements(filters: MovementFilterOptions): Promise<StockMovementEntity[]> {
    return this.movementRepository.findWithFilters(filters);
  }

  async recordMovement(data: {
    warehouseId: string;
    sourceWarehouseId?: string;
    productId: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    userId: string;
  }): Promise<StockMovementEntity> {
    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    // Verify warehouse and product exist
    const warehouse = await this.warehouseRepository.findById(data.warehouseId);
    if (!warehouse)
      throw new NotFoundException(`Warehouse ${data.warehouseId} not found`);

    const product = await this.productRepository.findById(data.productId);
    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product ${data.productId} not found or deleted`);
    }

    // Run transaction to ensure atomic update and hard non-negative invariant
    return this.dataSource.transaction(async (_manager) => {
      const currentStock = await this.stockLevelRepository.findByWarehouseAndProduct(
        data.warehouseId,
        data.productId,
      );

      const currentQty = currentStock ? currentStock.quantity : 0;
      let newQty = currentQty;

      if (data.type === 'inbound') {
        newQty += data.quantity;
      } else if (data.type === 'outbound') {
        newQty -= data.quantity;
      } else if (data.type === 'adjustment') {
        newQty = data.quantity;
      } else if (data.type === 'transfer') {
        newQty += data.quantity;
      }

      // Hard Invariant Check
      if (newQty < 0) {
        throw new BadRequestException(
          `Movement rejected: insufficient stock. Current stock is ${currentQty}, resulting quantity would be ${newQty}`,
        );
      }

      // Update Stock Level
      await this.stockLevelRepository.updateQuantity(
        data.warehouseId,
        data.productId,
        newQty,
      );

      // Log Movement Record
      return this.movementRepository.create(data);
    });
  }
}
