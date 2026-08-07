import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { DatabaseService } from './database.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), TypeOrmModule.forFeature([User, Role])],
  providers: [DatabaseService, UserRepository, RoleRepository],
  exports: [DatabaseService, UserRepository, RoleRepository],
})
export class DatabaseModule {}
