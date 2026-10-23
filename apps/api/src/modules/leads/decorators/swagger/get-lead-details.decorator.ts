import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LEADS_ERRORS, LEADS_MESSAGES } from '../../constants/leads.constants';

export function SwaggerGetLeadDetails() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get lead details by ID',
      description:
        'Retrieves the details of a lead. SALES_REP can only access their assigned leads.',
    }),
    ApiParam({ name: 'id', description: 'The ID of the lead to retrieve', type: String }),
    ApiResponse({
      status: 200,
      description: 'Lead retrieved successfully',
      schema: {
        example: {
          message: LEADS_MESSAGES.LEAD_RETRIEVED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            contactId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            title: 'Interested in Premium Plan',
            description: 'User requested a demo.',
            ownerId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            assignedBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            source: 'MANUAL',
            stage: 'NEW',
            createdBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            createdAt: 1756446803506,
            updatedAt: 1756446803506,
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
          path: '/api/v1/leads/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: LEADS_ERRORS.UNAUTHORIZED_ACCESS,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Lead not found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/leads/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: LEADS_ERRORS.LEAD_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
