import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutePermission } from '../entities/route-permission.entity';

@Injectable()
export class RoutePermissionRepository {
  constructor(
    @InjectRepository(RoutePermission)
    private readonly routePermRepo: Repository<RoutePermission>,
  ) {}

  getRepo(): Repository<RoutePermission> {
    return this.routePermRepo;
  }

  async findByRouteAndMethod(
    route: string,
    method: string,
  ): Promise<RoutePermission | null> {
    return this.routePermRepo.findOne({
      where: { route, method: method.toUpperCase() },
    });
  }

  async findAll(): Promise<RoutePermission[]> {
    return this.routePermRepo.find();
  }

  async createAndSave(data: Partial<RoutePermission>): Promise<RoutePermission> {
    if (data.method) {
      data.method = data.method.toUpperCase();
    }
    const routePerm = this.routePermRepo.create(data);
    return this.routePermRepo.save(routePerm);
  }
}
