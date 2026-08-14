import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../../database/repositories/activity.repository';
import { LeadRepository } from '../../database/repositories/lead.repository';
import { DealRepository } from '../../database/repositories/deal.repository';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from '../../database/entities/activity.entity';
import { User } from '../../database/entities/user.entity';
import { ACTIVITIES_ERRORS } from './constants/activities.constants';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly leadRepository: LeadRepository,
    private readonly dealRepository: DealRepository,
  ) {}

  async createActivity(
    createActivityDto: CreateActivityDto,
    currentUser: User,
    userRole: string,
  ): Promise<Activity> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(ACTIVITIES_ERRORS.USER_NO_ORG);
    }

    if (!createActivityDto.leadId && !createActivityDto.dealId) {
      throw new Error(ACTIVITIES_ERRORS.LEAD_OR_DEAL_REQUIRED);
    }

    let stage = '';

    if (createActivityDto.leadId) {
      const lead = await this.leadRepository.findById(createActivityDto.leadId);
      if (!lead || lead.organizationId !== orgId) {
        throw new Error(ACTIVITIES_ERRORS.LEAD_NOT_FOUND);
      }
      if (userRole === 'SALES_REP' && lead.ownerId !== currentUser.id) {
        throw new Error(ACTIVITIES_ERRORS.UNAUTHORIZED_ACCESS);
      }
      stage = lead.stage;
    } else if (createActivityDto.dealId) {
      const deal = await this.dealRepository.findById(createActivityDto.dealId);
      if (!deal || deal.organizationId !== orgId) {
        throw new Error(ACTIVITIES_ERRORS.DEAL_NOT_FOUND);
      }
      if (userRole === 'SALES_REP' && deal.ownerId !== currentUser.id) {
        throw new Error(ACTIVITIES_ERRORS.UNAUTHORIZED_ACCESS);
      }
      stage = deal.stage;
    }

    const newActivity = await this.activityRepository.createActivity({
      ...createActivityDto,
      stage,
      organizationId: orgId,
      createdBy: currentUser.id,
    });

    return (await this.activityRepository.findById(newActivity.id))!;
  }

  async getAllActivities(currentUser: User, userRole: string): Promise<Activity[]> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(ACTIVITIES_ERRORS.USER_NO_ORG);
    }

    // SALES_REP can only see their own activities (i.e. activities they created)
    const createdBy = userRole === 'SALES_REP' ? currentUser.id : undefined;

    return this.activityRepository.findAllActivities(orgId, createdBy);
  }

  async updateActivity(
    id: string,
    updateActivityDto: import('./dto/update-activity.dto').UpdateActivityDto,
    currentUser: User,
    userRole: string,
  ): Promise<Activity> {
    const orgId = currentUser.organizationId;
    if (!orgId) {
      throw new Error(ACTIVITIES_ERRORS.USER_NO_ORG);
    }

    const activity = await this.activityRepository.findById(id);
    if (!activity || activity.organizationId !== orgId) {
      throw new Error(ACTIVITIES_ERRORS.ACTIVITY_NOT_FOUND);
    }

    // SALES_REP can only update their own activities
    if (userRole === 'SALES_REP' && activity.createdBy !== currentUser.id) {
      throw new Error(ACTIVITIES_ERRORS.UNAUTHORIZED_ACCESS);
    }

    const updatedActivity = await this.activityRepository.updateActivity(
      id,
      updateActivityDto,
    );
    return updatedActivity!;
  }
}
