import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { DatabaseService } from './database.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Organization } from './entities/organization.entity';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { OrganizationRepository } from './repositories/organization.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Role, Organization]),
  ],
  providers: [DatabaseService, UserRepository, RoleRepository, OrganizationRepository],
  exports: [DatabaseService, UserRepository, RoleRepository, OrganizationRepository],
})
export class DatabaseModule {}
