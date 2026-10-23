import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseEntity } from '../../database/entities/WarehouseEntity';
import { WarehouseRepository } from '../../database/repositories/WarehouseRepository';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseEntity])],
  controllers: [WarehousesController],
  providers: [WarehousesService, WarehouseRepository],
  exports: [WarehousesService, WarehouseRepository],
})
export class WarehousesModule {}
