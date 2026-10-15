import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { HospitalAdmin } from './hospital-admin.entity';
import { UsersService } from './users.service';

/**
 * UsersModule — owns the `users` and `hospital_admins` tables.
 *
 * Table roles:
 *   users           → every person in the system (ADMIN | DOCTOR | PATIENT)
 *   hospital_admins → extended profile for users with role='ADMIN'
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, HospitalAdmin])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
