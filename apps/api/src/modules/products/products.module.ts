import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entities/ProductEntity';
import { CategoryEntity } from '../../database/entities/CategoryEntity';
import { StockLevelEntity } from '../../database/entities/StockLevelEntity';
import { StockMovementEntity } from '../../database/entities/StockMovementEntity';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { CategoryRepository } from '../../database/repositories/CategoryRepository';
import { StockLevelRepository } from '../../database/repositories/StockLevelRepository';
import { StockMovementRepository } from '../../database/repositories/StockMovementRepository';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      StockLevelEntity,
      StockMovementEntity,
    ]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductRepository,
    CategoryRepository,
    StockLevelRepository,
    StockMovementRepository,
  ],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
