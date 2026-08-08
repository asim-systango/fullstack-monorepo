import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { WarehouseRepository } from '../../database/repositories/WarehouseRepository';
import { StockLevelRepository } from '../../database/repositories/StockLevelRepository';
import { StockMovementRepository } from '../../database/repositories/StockMovementRepository';

export interface ProductSummaryDto {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  totalQuantity: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly warehouseRepository: WarehouseRepository,
    private readonly stockLevelRepository: StockLevelRepository,
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  async getMetrics() {
    const products = await this.productRepository.findAll(false);
    const warehouses = await this.warehouseRepository.findAll();
    const movements = await this.stockMovementRepository.findWithFilters({});

    let totalStockUnits = 0;
    const productSummaries: ProductSummaryDto[] = [];

    for (const product of products) {
      let productTotalStock = 0;
      if (product.stockLevels && Array.isArray(product.stockLevels)) {
        for (const level of product.stockLevels) {
          productTotalStock += level.quantity || 0;
        }
      }
      totalStockUnits += productTotalStock;

      productSummaries.push({
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        unit: product.unit,
        totalQuantity: productTotalStock,
      });
    }

    return {
      totalProducts: products.length,
      totalWarehouses: warehouses.length,
      totalStockUnits,
      productSummaries,
      recentMovements: movements.slice(0, 5),
    };
  }
}
