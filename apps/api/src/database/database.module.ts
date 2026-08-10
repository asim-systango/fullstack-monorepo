import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { DatabaseService } from './database.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Organization } from './entities/organization.entity';
import { Permission } from './entities/permission.entity';
import { RoutePermission } from './entities/route-permission.entity';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { OrganizationRepository } from './repositories/organization.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RoutePermissionRepository } from './repositories/route-permission.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Role, Organization, Permission, RoutePermission]),
  ],
  providers: [
    DatabaseService,
    UserRepository,
    RoleRepository,
    OrganizationRepository,
    PermissionRepository,
    RoutePermissionRepository,
  ],
  exports: [
    DatabaseService,
    UserRepository,
    RoleRepository,
    OrganizationRepository,
    PermissionRepository,
    RoutePermissionRepository,
  ],
})
export class DatabaseModule {}
