import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { WarehouseRepository } from '../../database/repositories/WarehouseRepository';
import { StockLevelRepository } from '../../database/repositories/StockLevelRepository';
import { StockMovementRepository } from '../../database/repositories/StockMovementRepository';
import type { JwtUser } from '../../common/auth/jwt-user';

export interface DashboardMetricsDto {
  totalProducts: number;
  totalWarehouses: number;
  totalStockUnits: number;
  totalMonthlyMovements: number;
  totalLowStockItems: number;
  recentMovements: unknown[];
  scopedWarehouse?: {
    id: string;
    name: string;
    code: string;
    location: string;
  } | null;
}

export interface ChartSegmentDto {
  id?: string;
  label: string;
  value: number;
  color?: string;
  subtext?: string;
  type?: string;
  status?: string;
}

const PALETTE = [
  '#4747A1', // Primary Indigo
  '#7978E9', // Secondary Iris Purple
  '#7DA0FA', // Accent Soft Blue
  '#38BDF8', // Sky Blue
  '#34D399', // Emerald Green
  '#F87171', // Coral Red
  '#FBBF24', // Amber
  '#A78BFA', // Light Violet
  '#F472B6', // Pink
  '#2DD4BF', // Teal
];

@Injectable()
export class DashboardService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly warehouseRepository: WarehouseRepository,
    private readonly stockLevelRepository: StockLevelRepository,
    private readonly stockMovementRepository: StockMovementRepository,
  ) {}

  private resolveWarehouseId(
    user?: JwtUser,
    warehouseIdQuery?: string,
  ): string | undefined {
    if (user?.role === 'staff' && user.warehouseId) {
      return warehouseIdQuery || user.warehouseId;
    }
    return warehouseIdQuery || undefined;
  }

  async getMetrics(
    user?: JwtUser,
    warehouseIdQuery?: string,
  ): Promise<DashboardMetricsDto> {
    const targetWarehouseId = this.resolveWarehouseId(user, warehouseIdQuery);

    const [products, warehouses] = await Promise.all([
      this.productRepository.findAll(false),
      this.warehouseRepository.findAll(),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await this.stockMovementRepository.findWithFilters({
      warehouseId: targetWarehouseId,
      dateFrom: thirtyDaysAgo.toISOString(),
    });

    let totalStockUnits = 0;
    let totalLowStockItems = 0;
    const threshold = 5;

    for (const product of products) {
      let productQty = 0;
      if (product.stockLevels && Array.isArray(product.stockLevels)) {
        for (const sl of product.stockLevels) {
          if (!targetWarehouseId || sl.warehouseId === targetWarehouseId) {
            productQty += sl.quantity || 0;
          }
        }
      }

      totalStockUnits += productQty;
      if (productQty <= threshold) {
        totalLowStockItems += 1;
      }
    }

    let scopedWarehouse = null;
    if (targetWarehouseId) {
      const wh = warehouses.find((w) => w.id === targetWarehouseId);
      if (wh) {
        scopedWarehouse = {
          id: wh.id,
          name: wh.name,
          code: wh.code,
          location: wh.location,
        };
      }
    }

    return {
      totalProducts: products.length,
      totalWarehouses: warehouses.length,
      totalStockUnits,
      totalMonthlyMovements: movements.length,
      totalLowStockItems,
      recentMovements: movements.slice(0, 5),
      scopedWarehouse,
    };
  }

  async getCategoryStock(
    user?: JwtUser,
    warehouseIdQuery?: string,
  ): Promise<ChartSegmentDto[]> {
    const targetWarehouseId = this.resolveWarehouseId(user, warehouseIdQuery);
    const products = await this.productRepository.findAll(false);

    const categoryMap: Record<string, number> = {};

    for (const product of products) {
      const catName = product.category?.name || 'Uncategorized';
      let qty = 0;

      if (product.stockLevels && Array.isArray(product.stockLevels)) {
        for (const sl of product.stockLevels) {
          if (!targetWarehouseId || sl.warehouseId === targetWarehouseId) {
            qty += sl.quantity || 0;
          }
        }
      }

      categoryMap[catName] = (categoryMap[catName] || 0) + qty;
    }

    const segments: ChartSegmentDto[] = Object.entries(categoryMap)
      .map(([label, value], idx) => ({
        label,
        value,
        color: PALETTE[idx % PALETTE.length],
      }))
      .filter((s) => s.value > 0);

    return segments;
  }

  async getWarehouseStockDistribution(): Promise<ChartSegmentDto[]> {
    const [warehouses, products] = await Promise.all([
      this.warehouseRepository.findAll(),
      this.productRepository.findAll(false),
    ]);

    const warehouseTotals: Record<string, number> = {};
    for (const wh of warehouses) {
      warehouseTotals[wh.id] = 0;
    }

    for (const product of products) {
      if (product.stockLevels && Array.isArray(product.stockLevels)) {
        for (const sl of product.stockLevels) {
          if (sl.warehouseId) {
            const currentVal = warehouseTotals[sl.warehouseId] ?? 0;
            warehouseTotals[sl.warehouseId] = currentVal + (sl.quantity || 0);
          }
        }
      }
    }

    return warehouses
      .map((wh, idx) => ({
        id: wh.id,
        label: wh.name,
        subtext: wh.code,
        value: warehouseTotals[wh.id] ?? 0,
        color: PALETTE[idx % PALETTE.length],
      }))
      .filter((s) => s.value > 0);
  }

  async getMonthlyMovements(
    user?: JwtUser,
    warehouseIdQuery?: string,
    days = 30,
  ): Promise<ChartSegmentDto[]> {
    const targetWarehouseId = this.resolveWarehouseId(user, warehouseIdQuery);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const movements = await this.stockMovementRepository.findWithFilters({
      warehouseId: targetWarehouseId,
      dateFrom: startDate.toISOString(),
    });

    let inboundQty = 0;
    let outboundQty = 0;
    let transferQty = 0;
    let adjustmentQty = 0;

    for (const m of movements) {
      const q = m.quantity || 1;
      if (m.type === 'inbound') inboundQty += q;
      else if (m.type === 'outbound') outboundQty += q;
      else if (m.type === 'transfer') transferQty += q;
      else adjustmentQty += q;
    }

    const segments: ChartSegmentDto[] = [];
    if (inboundQty > 0) {
      segments.push({
        type: 'inbound',
        label: 'Inbound Receipts',
        value: inboundQty,
        color: '#34D399', // Emerald
      });
    }
    if (outboundQty > 0) {
      segments.push({
        type: 'outbound',
        label: 'Outbound Shipments',
        value: outboundQty,
        color: '#F87171', // Coral Red
      });
    }
    if (transferQty > 0) {
      segments.push({
        type: 'transfer',
        label: 'Inter-Facility Transfers',
        value: transferQty,
        color: '#7978E9', // Iris Purple
      });
    }
    if (adjustmentQty > 0) {
      segments.push({
        type: 'adjustment',
        label: 'Audits & Adjustments',
        value: adjustmentQty,
        color: '#7DA0FA', // Soft Blue
      });
    }

    return segments;
  }

  async getStockHealth(
    user?: JwtUser,
    warehouseIdQuery?: string,
    threshold = 5,
  ): Promise<ChartSegmentDto[]> {
    const targetWarehouseId = this.resolveWarehouseId(user, warehouseIdQuery);
    const products = await this.productRepository.findAll(false);

    let optimalCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const product of products) {
      let qty = 0;
      if (product.stockLevels && Array.isArray(product.stockLevels)) {
        for (const sl of product.stockLevels) {
          if (!targetWarehouseId || sl.warehouseId === targetWarehouseId) {
            qty += sl.quantity || 0;
          }
        }
      }

      if (qty === 0) {
        outOfStockCount += 1;
      } else if (qty <= threshold) {
        lowStockCount += 1;
      } else {
        optimalCount += 1;
      }
    }

    const segments: ChartSegmentDto[] = [];
    if (optimalCount > 0) {
      segments.push({
        status: 'optimal',
        label: 'Optimal Stock Level',
        value: optimalCount,
        color: '#34D399',
      });
    }
    if (lowStockCount > 0) {
      segments.push({
        status: 'low_stock',
        label: 'Low Stock Alert',
        value: lowStockCount,
        color: '#FBBF24',
      });
    }
    if (outOfStockCount > 0) {
      segments.push({
        status: 'out_of_stock',
        label: 'Depleted / Zero Units',
        value: outOfStockCount,
        color: '#F87171',
      });
    }

    return segments;
  }
}
