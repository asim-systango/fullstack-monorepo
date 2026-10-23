import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateActivityDto } from '../../dto/create-activity.dto';
import {
  ACTIVITIES_ERRORS,
  ACTIVITIES_MESSAGES,
} from '../../constants/activities.constants';
import { ActivityType } from '../../../../database/entities/activity.entity';

export function SwaggerCreateActivity() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new activity',
      description:
        'Creates a new activity (e.g., call, meeting, note) linked to a lead or a deal.',
    }),
    ApiBody({ type: CreateActivityDto }),
    ApiResponse({
      status: 201,
      description: 'Activity created successfully',
      schema: {
        example: {
          message: ACTIVITIES_MESSAGES.ACTIVITY_CREATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            leadId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            activityType: ActivityType.CALL,
            title: 'Initial Intro Call',
            description: 'Discuss requirements',
            stage: 'NEW',
            dueAt: 1756446803506,
            createdBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            createdAt: 1756446803506,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed or missing lead/deal ID',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/activities',
          error: ACTIVITIES_ERRORS.LEAD_OR_DEAL_REQUIRED,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden / Unauthorized access',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/activities',
          error: ACTIVITIES_ERRORS.UNAUTHORIZED_ACCESS,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Lead or Deal not found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/activities',
          error: ACTIVITIES_ERRORS.LEAD_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
