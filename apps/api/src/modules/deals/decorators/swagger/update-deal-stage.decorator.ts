import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateDealStageDto } from '../../dto/update-deal-stage.dto';
import { DEALS_ERRORS, DEALS_MESSAGES } from '../../constants/deals.constants';
import { DealStage } from '../../../../database/entities/deal.entity';

export function SwaggerUpdateDealStage() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update deal stage',
      description:
        'Updates the stage of an existing deal. SALES_REP can only update the stage of their own deals.',
    }),
    ApiParam({ name: 'id', description: 'The ID of the deal to update', type: String }),
    ApiBody({ type: UpdateDealStageDto }),
    ApiResponse({
      status: 200,
      description: 'Deal stage updated successfully',
      schema: {
        example: {
          message: DEALS_MESSAGES.DEAL_STAGE_UPDATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            stage: DealStage.WON,
            wonAt: 1756446803506,
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
          path: '/api/v1/deals/01K3RG6NZZNHQ3WVCYX6HKYQFY/stage',
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
          path: '/api/v1/deals/01K3RG6NZZNHQ3WVCYX6HKYQFY/stage',
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
