import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { WarehouseRepository } from '../../database/repositories/WarehouseRepository';
import { WarehouseEntity } from '../../database/entities/WarehouseEntity';

@Injectable()
export class WarehousesService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async getAllWarehouses(): Promise<WarehouseEntity[]> {
    return this.warehouseRepository.findAll();
  }

  async getWarehouseById(id: string): Promise<WarehouseEntity> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return warehouse;
  }

  async createWarehouse(data: {
    code: string;
    name: string;
    location: string;
  }): Promise<WarehouseEntity> {
    const existing = await this.warehouseRepository.findByCode(data.code);
    if (existing) {
      throw new ConflictException(
        `Warehouse with code ${data.code.toUpperCase()} already exists`,
      );
    }
    return this.warehouseRepository.create(data);
  }

  async updateWarehouse(
    id: string,
    data: Partial<Pick<WarehouseEntity, 'name' | 'location'>>,
  ): Promise<WarehouseEntity> {
    await this.getWarehouseById(id);
    const updated = await this.warehouseRepository.update(id, data);
    return updated!;
  }
}
