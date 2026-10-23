import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DEALS_ERRORS, DEALS_MESSAGES } from '../../constants/deals.constants';

export function SwaggerGetAllDeals() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get all deals',
      description:
        'Retrieves a list of deals for the organization. SALES_REP can only see deals assigned to them.',
    }),
    ApiResponse({
      status: 200,
      description: 'Deals retrieved successfully',
      schema: {
        example: {
          message: DEALS_MESSAGES.DEALS_RETRIEVED,
          data: [
            {
              id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              leadId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              contactId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              title: 'Enterprise Software License',
              amount: 50000,
              stage: 'OPEN',
              probability: 50,
              expectedCloseDate: '2026-12-31',
              ownerId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              createdAt: 1756446803506,
              lead: {
                title: 'Interested in Premium Plan',
              },
              contact: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
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
          path: '/api/v1/deals',
          error: DEALS_ERRORS.USER_NO_ORG,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
