import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { Roles } from '../../common/auth';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @Roles('admin', 'staff')
  async findAll() {
    const warehouses = await this.warehousesService.getAllWarehouses();
    return { data: warehouses };
  }

  @Get(':id')
  @Roles('admin', 'staff')
  async findOne(@Param('id') id: string) {
    const warehouse = await this.warehousesService.getWarehouseById(id);
    return { data: warehouse };
  }

  @Post()
  @Roles('admin', 'staff')
  async create(@Body() dto: CreateWarehouseDto) {
    const warehouse = await this.warehousesService.createWarehouse(dto);
    return { data: warehouse };
  }

  @Patch(':id')
  @Roles('admin', 'staff')
  async update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    const warehouse = await this.warehousesService.updateWarehouse(id, dto);
    return { data: warehouse };
  }
}
