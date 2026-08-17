import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { DatabaseService } from './database.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Organization } from './entities/organization.entity';
import { Permission } from './entities/permission.entity';
import { RoutePermission } from './entities/route-permission.entity';
import { FormSubmission } from './entities/form-submission.entity';
import { Contact } from './entities/contact.entity';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';
import { Activity } from './entities/activity.entity';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { OrganizationRepository } from './repositories/organization.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RoutePermissionRepository } from './repositories/route-permission.repository';
import { FormSubmissionRepository } from './repositories/form-submission.repository';
import { ContactRepository } from './repositories/contact.repository';
import { LeadRepository } from './repositories/lead.repository';
import { DealRepository } from './repositories/deal.repository';
import { ActivityRepository } from './repositories/activity.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      User,
      Role,
      Organization,
      Permission,
      RoutePermission,
      FormSubmission,
      Contact,
      Lead,
      Deal,
      Activity,
    ]),
  ],
  providers: [
    DatabaseService,
    UserRepository,
    RoleRepository,
    OrganizationRepository,
    PermissionRepository,
    RoutePermissionRepository,
    FormSubmissionRepository,
    ContactRepository,
    LeadRepository,
    DealRepository,
    ActivityRepository,
  ],
  exports: [
    DatabaseService,
    UserRepository,
    RoleRepository,
    OrganizationRepository,
    PermissionRepository,
    RoutePermissionRepository,
    FormSubmissionRepository,
    ContactRepository,
    LeadRepository,
    DealRepository,
    ActivityRepository,
  ],
})
export class DatabaseModule {}
