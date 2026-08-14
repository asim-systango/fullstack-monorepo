import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateDealDto } from '../../dto/create-deal.dto';
import { DEALS_ERRORS, DEALS_MESSAGES } from '../../constants/deals.constants';

export function SwaggerCreateDeal() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new deal',
      description:
        'Creates a new deal from a lead within the same organization. SALES_REP can only convert their own leads.',
    }),
    ApiBody({ type: CreateDealDto }),
    ApiResponse({
      status: 201,
      description: 'Deal created successfully',
      schema: {
        example: {
          message: DEALS_MESSAGES.DEAL_CREATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            leadId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            contactId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            title: 'Enterprise Software License',
            description: '500 users license.',
            ownerId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            amount: 50000,
            probability: 50,
            stage: 'OPEN',
            expectedCloseDate: '2026-12-31',
            createdBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden / Unauthorized access',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/deals',
          error: DEALS_ERRORS.UNAUTHORIZED_ACCESS,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Lead, Contact, or Owner not found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/deals',
          error: DEALS_ERRORS.LEAD_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict / Lead already converted',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/deals',
          error: DEALS_ERRORS.LEAD_ALREADY_CONVERTED,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}
