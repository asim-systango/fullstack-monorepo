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
    warehouseId?: string;
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

    let targetWarehouseId = data.warehouseId;
    if (!targetWarehouseId) {
      const allWarehouses = await this.warehouseRepository.findAll();
      const firstWarehouse = allWarehouses[0];
      if (!firstWarehouse) {
        throw new NotFoundException('No warehouse available');
      }
      targetWarehouseId = firstWarehouse.id;
    }

    const resolvedWarehouseId: string = targetWarehouseId;

    // Verify warehouse and product exist
    const warehouse = await this.warehouseRepository.findById(resolvedWarehouseId);
    if (!warehouse)
      throw new NotFoundException(`Warehouse ${resolvedWarehouseId} not found`);

    const product = await this.productRepository.findById(data.productId);
    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product ${data.productId} not found or deleted`);
    }

    // Run transaction to ensure atomic update and hard non-negative invariant
    return this.dataSource.transaction(async (_manager) => {
      const currentStock = await this.stockLevelRepository.findByWarehouseAndProduct(
        resolvedWarehouseId,
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
        resolvedWarehouseId,
        data.productId,
        newQty,
      );

      // Log Movement Record
      return this.movementRepository.create({
        ...data,
        warehouseId: resolvedWarehouseId,
      });
    });
  }

  async recordTransfer(data: {
    sourceWarehouseId: string;
    destWarehouseId: string;
    productId: string;
    quantity: number;
    reason?: string;
    userId: string;
  }): Promise<{ outbound: StockMovementEntity; inbound: StockMovementEntity }> {
    if (data.sourceWarehouseId === data.destWarehouseId) {
      throw new BadRequestException(
        'Source and destination warehouses cannot be the same',
      );
    }
    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    const sourceWarehouse = await this.warehouseRepository.findById(
      data.sourceWarehouseId,
    );
    if (!sourceWarehouse) {
      throw new NotFoundException(`Source warehouse ${data.sourceWarehouseId} not found`);
    }

    const destWarehouse = await this.warehouseRepository.findById(data.destWarehouseId);
    if (!destWarehouse) {
      throw new NotFoundException(
        `Destination warehouse ${data.destWarehouseId} not found`,
      );
    }

    const product = await this.productRepository.findById(data.productId);
    if (!product || product.isDeleted) {
      throw new NotFoundException(`Product ${data.productId} not found or deleted`);
    }

    return this.dataSource.transaction(async (_manager) => {
      // 1. Check & Decrement Source Warehouse Stock
      const sourceStock = await this.stockLevelRepository.findByWarehouseAndProduct(
        data.sourceWarehouseId,
        data.productId,
      );
      const sourceCurrentQty = sourceStock ? sourceStock.quantity : 0;
      const sourceNewQty = sourceCurrentQty - data.quantity;

      if (sourceNewQty < 0) {
        throw new BadRequestException(
          `Transfer rejected: insufficient stock at source warehouse (${sourceWarehouse.name}). Current stock is ${sourceCurrentQty}, requested transfer quantity is ${data.quantity}`,
        );
      }

      await this.stockLevelRepository.updateQuantity(
        data.sourceWarehouseId,
        data.productId,
        sourceNewQty,
      );

      // 2. Increment Destination Warehouse Stock
      const destStock = await this.stockLevelRepository.findByWarehouseAndProduct(
        data.destWarehouseId,
        data.productId,
      );
      const destCurrentQty = destStock ? destStock.quantity : 0;
      const destNewQty = destCurrentQty + data.quantity;

      await this.stockLevelRepository.updateQuantity(
        data.destWarehouseId,
        data.productId,
        destNewQty,
      );

      // 3. Log Outbound Movement for Source
      const outbound = await this.movementRepository.create({
        warehouseId: data.sourceWarehouseId,
        productId: data.productId,
        type: 'outbound',
        quantity: data.quantity,
        reason:
          data.reason ||
          `Inter-warehouse transfer to ${destWarehouse.name} (${destWarehouse.code})`,
        userId: data.userId,
      });

      // 4. Log Inbound Transfer Movement for Destination
      const inbound = await this.movementRepository.create({
        warehouseId: data.destWarehouseId,
        sourceWarehouseId: data.sourceWarehouseId,
        productId: data.productId,
        type: 'transfer',
        quantity: data.quantity,
        reason:
          data.reason ||
          `Inter-warehouse transfer from ${sourceWarehouse.name} (${sourceWarehouse.code})`,
        userId: data.userId,
      });

      return { outbound, inbound };
    });
  }
}
