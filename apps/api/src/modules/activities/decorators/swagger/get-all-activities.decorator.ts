import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  ACTIVITIES_ERRORS,
  ACTIVITIES_MESSAGES,
} from '../../constants/activities.constants';
import { ActivityType } from '../../../../database/entities/activity.entity';

export function SwaggerGetAllActivities() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get all activities',
      description:
        'Retrieves a list of activities for the organization. SALES_REP can only see their own activities.',
    }),
    ApiResponse({
      status: 200,
      description: 'Activities retrieved successfully',
      schema: {
        example: {
          message: ACTIVITIES_MESSAGES.ACTIVITIES_RETRIEVED,
          data: [
            {
              id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              leadId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              dealId: null,
              activityType: ActivityType.CALL,
              title: 'Initial Intro Call',
              description: 'Discuss requirements',
              stage: 'NEW',
              dueAt: 1756446803506,
              completedAt: null,
              createdBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              createdAt: 1756446803506,
              lead: {
                title: 'Interested in Premium Plan',
              },
            },
          ],
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
          error: ACTIVITIES_ERRORS.USER_NO_ORG,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
