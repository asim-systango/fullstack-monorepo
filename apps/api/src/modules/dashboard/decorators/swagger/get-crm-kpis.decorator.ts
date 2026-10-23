import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetCrmKpisSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get CRM Workspace KPI metrics',
      description:
        'Retrieves aggregated CRM KPI metrics including open leads count, total leads, open pipeline value, active deals count, total won value, won deals count, and total contacts. Scoped by organization and sales rep role.',
    }),
    ApiResponse({
      status: 200,
      description: 'Workspace CRM KPI metrics retrieved successfully',
      schema: {
        example: {
          openLeadsCount: 3,
          totalLeadsCount: 4,
          openPipelineAmount: 1250000,
          activeDealsCount: 1,
          wonAmount: 0,
          wonDealsCount: 0,
          contactsCount: 4,
          lostDealsCount: 0,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing bearer token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - User does not belong to an organization',
    }),
  );
}
