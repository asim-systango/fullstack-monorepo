import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entities/ProductEntity';
import { WarehouseEntity } from '../../database/entities/WarehouseEntity';
import { StockLevelEntity } from '../../database/entities/StockLevelEntity';
import { StockMovementEntity } from '../../database/entities/StockMovementEntity';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { WarehouseRepository } from '../../database/repositories/WarehouseRepository';
import { StockLevelRepository } from '../../database/repositories/StockLevelRepository';
import { StockMovementRepository } from '../../database/repositories/StockMovementRepository';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      WarehouseEntity,
      StockLevelEntity,
      StockMovementEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    ProductRepository,
    WarehouseRepository,
    StockLevelRepository,
    StockMovementRepository,
  ],
})
export class DashboardModule {}
