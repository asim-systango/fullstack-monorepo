import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entities/ProductEntity';
import { CategoryEntity } from '../../database/entities/CategoryEntity';
import { ProductRepository } from '../../database/repositories/ProductRepository';
import { CategoryRepository } from '../../database/repositories/CategoryRepository';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, CategoryRepository],
  exports: [ProductsService, ProductRepository],
})
export class ProductsModule {}
