import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DEALS_ERRORS, DEALS_MESSAGES } from '../../constants/deals.constants';

export function SwaggerGetDealDetails() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get deal details by ID',
      description:
        'Retrieves the details of a deal including associated lead, contact, and owner. SALES_REP can only access their assigned deals.',
    }),
    ApiParam({ name: 'id', description: 'The ID of the deal to retrieve', type: String }),
    ApiResponse({
      status: 200,
      description: 'Deal retrieved successfully',
      schema: {
        example: {
          message: DEALS_MESSAGES.DEAL_RETRIEVED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            leadId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            contactId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            title: 'Enterprise Software License',
            description: '500 users enterprise plan.',
            amount: 50000,
            probability: 60,
            stage: 'OPEN',
            expectedCloseDate: '2026-12-31',
            ownerId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            createdBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            createdAt: 1756446803506,
            updatedAt: 1756446803506,
            lead: {
              id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              title: 'Interested in Premium Plan',
            },
            contact: {
              id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
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
          path: '/api/v1/deals/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: DEALS_ERRORS.UNAUTHORIZED_ACCESS,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Deal not found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/deals/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: DEALS_ERRORS.DEAL_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
