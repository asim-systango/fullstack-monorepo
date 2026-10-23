import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  getRepo(): Repository<Permission> {
    return this.permissionRepo;
  }

  async findById(id: string): Promise<Permission | null> {
    return this.permissionRepo.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepo.findOne({ where: { name } });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    if (!ids || ids.length === 0) return [];
    return this.permissionRepo.find({ where: { id: In(ids) } });
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { name: 'ASC' } });
  }

  async createAndSave(data: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepo.create(data);
    return this.permissionRepo.save(permission);
  }
}
