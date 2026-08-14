import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from '../../database/entities/activity.entity';
import { Lead } from '../../database/entities/lead.entity';
import { Deal } from '../../database/entities/deal.entity';
import { ActivityRepository } from '../../database/repositories/activity.repository';
import { LeadRepository } from '../../database/repositories/lead.repository';
import { DealRepository } from '../../database/repositories/deal.repository';
import { User } from '../../database/entities/user.entity';
import { UserRepository } from '../../database/repositories/user.repository';
import { Role } from '../../database/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Lead, Deal, User, Role])],
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    ActivityRepository,
    LeadRepository,
    DealRepository,
    UserRepository,
  ],
})
export class ActivitiesModule {}
