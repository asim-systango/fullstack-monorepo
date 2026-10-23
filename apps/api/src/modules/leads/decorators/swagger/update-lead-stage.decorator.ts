import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateLeadStageDto } from '../../dto/update-lead-stage.dto';
import { LEADS_ERRORS, LEADS_MESSAGES } from '../../constants/leads.constants';

export function SwaggerUpdateLeadStage() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update lead stage',
      description:
        'Updates the stage of a lead. SALES_REP can only update their own assigned leads.',
    }),
    ApiParam({ name: 'id', description: 'The ID of the lead to update', type: String }),
    ApiBody({ type: UpdateLeadStageDto }),
    ApiResponse({
      status: 200,
      description: 'Lead stage updated successfully',
      schema: {
        example: {
          message: LEADS_MESSAGES.LEAD_STAGE_UPDATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            stage: 'QUALIFIED',
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
          path: '/api/v1/leads/01K3RG6NZZNHQ3WVCYX6HKYQFY/stage',
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
          path: '/api/v1/leads/01K3RG6NZZNHQ3WVCYX6HKYQFY/stage',
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
