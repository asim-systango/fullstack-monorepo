import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateDealDto } from '../../dto/update-deal.dto';
import { DEALS_ERRORS, DEALS_MESSAGES } from '../../constants/deals.constants';

export function SwaggerUpdateDeal() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update deal details',
      description:
        'Updates details of an existing deal. Only admins and sales leads can update deal details.',
    }),
    ApiParam({ name: 'id', description: 'The ID of the deal to update', type: String }),
    ApiBody({ type: UpdateDealDto }),
    ApiResponse({
      status: 200,
      description: 'Deal updated successfully',
      schema: {
        example: {
          message: DEALS_MESSAGES.DEAL_UPDATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            title: 'Updated Enterprise License',
            amount: 60000,
            stage: 'OPEN',
            expectedCloseDate: '2026-12-31',
            updatedAt: 1756446803506,
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
          path: '/api/v1/deals/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: DEALS_ERRORS.UNAUTHORIZED_ACCESS,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Deal or referenced entity not found',
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
