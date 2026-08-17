import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetOverallKpisSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get overall dashboard KPI statistics (Super Admin only)',
      description:
        'Retrieves overall system-wide KPI statistics including organization counts, platform user counts, pending invite counts, and onboarding request metrics. Requires read:overall-kpis permission.',
    }),
    ApiResponse({
      status: 200,
      description: 'Overall KPI metrics retrieved successfully',
      schema: {
        example: {
          organizations: {
            total: 12,
            active: 10,
          },
          platformUsers: {
            total: 45,
            pendingInvites: 8,
          },
          organizationRequests: {
            total: 15,
            pending: 5,
            inReview: 3,
            approved: 5,
            rejected: 2,
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing bearer token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - User does not have read:overall-kpis permission',
    }),
  );
}
