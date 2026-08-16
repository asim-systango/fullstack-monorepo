import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockLevelEntity } from '../entities/StockLevelEntity';

@Injectable()
export class StockLevelRepository {
  constructor(
    @InjectRepository(StockLevelEntity)
    private readonly repo: Repository<StockLevelEntity>,
  ) {}

  async findByWarehouseAndProduct(
    warehouseId: string,
    productId: string,
  ): Promise<StockLevelEntity | null> {
    return this.repo.findOne({
      where: { warehouseId, productId },
    });
  }

  async findByWarehouse(warehouseId: string): Promise<StockLevelEntity[]> {
    return this.repo.find({
      where: { warehouseId },
      relations: ['product'],
    });
  }

  async findByProduct(productId: string): Promise<StockLevelEntity[]> {
    return this.repo.find({
      where: { productId },
      relations: ['warehouse'],
    });
  }

  async updateQuantity(
    warehouseId: string,
    productId: string,
    newQuantity: number,
  ): Promise<StockLevelEntity> {
    let stockLevel = await this.findByWarehouseAndProduct(warehouseId, productId);
    if (!stockLevel) {
      stockLevel = this.repo.create({
        warehouseId,
        productId,
        quantity: newQuantity,
      });
    } else {
      stockLevel.quantity = newQuantity;
    }
    return this.repo.save(stockLevel);
  }
}
