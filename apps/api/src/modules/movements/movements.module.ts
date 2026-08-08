import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementEntity } from '../../database/entities/StockMovementEntity';
import { StockLevelEntity } from '../../database/entities/StockLevelEntity';
import { WarehouseEntity } from '../../database/entities/WarehouseEntity';
import { ProductEntity } from '../../database/entities/ProductEntity';
import { StockMovementRepository } from '../../database/repositories/StockMovementRepository';
import { StockLevelRepository } from '../../database/repositories/StockLevelRepository';
import { WarehouseRepository } from '../../database/repositories/WarehouseRepository';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockMovementEntity,
      StockLevelEntity,
      WarehouseEntity,
      ProductEntity,
    ]),
  ],
  controllers: [MovementsController],
  providers: [
    MovementsService,
    StockMovementRepository,
    StockLevelRepository,
    WarehouseRepository,
    ProductRepository,
  ],
  exports: [MovementsService, StockMovementRepository],
})
export class MovementsModule {}
