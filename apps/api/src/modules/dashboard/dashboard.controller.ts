import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../../common/auth';
import type { JwtUser } from '../../common/auth/jwt-user';
import { DashboardService } from './dashboard.service';

interface AuthenticatedRequest extends Request {
  user?: JwtUser;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * High-level KPI summary metrics (Total Units, Monthly Actions, Low Stock, etc.)
   * Scoped to warehouseId (if staff or if requested by admin).
   */
  @Get('metrics')
  @Roles('admin', 'staff', 'user')
  async getMetrics(
    @Req() req: AuthenticatedRequest,
    @Query('warehouseId') warehouseId?: string,
  ) {
    const metrics = await this.dashboardService.getMetrics(req.user, warehouseId);
    return { data: metrics };
  }

  /**
   * Product distribution by Category in stock.
   * Admin: Overall enterprise stock units by category.
   * Staff: Stock units by category in staff's warehouse.
   */
  @Get('charts/category-stock')
  @Roles('admin', 'staff', 'user')
  async getCategoryStock(
    @Req() req: AuthenticatedRequest,
    @Query('warehouseId') warehouseId?: string,
  ) {
    const segments = await this.dashboardService.getCategoryStock(req.user, warehouseId);
    return { data: segments };
  }

  /**
   * Warehouse stock distribution across facilities.
   * Admin-only access.
   */
  @Get('charts/warehouse-stock')
  @Roles('admin')
  async getWarehouseStockDistribution() {
    const segments = await this.dashboardService.getWarehouseStockDistribution();
    return { data: segments };
  }

  /**
   * Monthly Inbound vs Outbound Movements.
   * Admin: All network movements in past 30 days.
   * Staff: Facility movements in past 30 days.
   */
  @Get('charts/monthly-movements')
  @Roles('admin', 'staff', 'user')
  async getMonthlyMovements(
    @Req() req: AuthenticatedRequest,
    @Query('warehouseId') warehouseId?: string,
    @Query('days') days?: number,
  ) {
    const segments = await this.dashboardService.getMonthlyMovements(
      req.user,
      warehouseId,
      days ? Number(days) : 30,
    );
    return { data: segments };
  }

  /**
   * Stock Health / Status Breakdown (Optimal vs Low Stock vs Out-of-Stock).
   */
  @Get('charts/stock-health')
  @Roles('admin', 'staff', 'user')
  async getStockHealth(
    @Req() req: AuthenticatedRequest,
    @Query('warehouseId') warehouseId?: string,
    @Query('threshold') threshold?: number,
  ) {
    const segments = await this.dashboardService.getStockHealth(
      req.user,
      warehouseId,
      threshold ? Number(threshold) : 5,
    );
    return { data: segments };
  }
}
