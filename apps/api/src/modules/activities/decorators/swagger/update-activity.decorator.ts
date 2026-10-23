import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UpdateActivityDto } from '../../dto/update-activity.dto';
import {
  ACTIVITIES_ERRORS,
  ACTIVITIES_MESSAGES,
} from '../../constants/activities.constants';

export function SwaggerUpdateActivity() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update an activity',
      description:
        'Updates details of an activity. Used to mark activities as completed by updating completedAt. SALES_REP can only update their own activities.',
    }),
    ApiBody({ type: UpdateActivityDto }),
    ApiResponse({
      status: 200,
      description: 'Activity updated successfully',
      schema: {
        example: {
          message: ACTIVITIES_MESSAGES.ACTIVITY_UPDATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            title: 'Follow-up Call',
            description: 'Discussed next steps',
            dueAt: 1756446803506,
            completedAt: 1756446803506,
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden / Unauthorized access',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/activities/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: ACTIVITIES_ERRORS.UNAUTHORIZED_ACCESS,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Activity not found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/activities/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: ACTIVITIES_ERRORS.ACTIVITY_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
