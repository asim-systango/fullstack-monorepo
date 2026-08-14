import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateLeadDto } from '../../dto/update-lead.dto';
import { LEADS_ERRORS, LEADS_MESSAGES } from '../../constants/leads.constants';

export function SwaggerUpdateLead() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update lead details',
      description:
        'Updates a lead within the same organization. Requires ORG_ADMIN or SALES_LEAD access.',
    }),
    ApiParam({ name: 'id', description: 'The ID of the lead to update', type: String }),
    ApiBody({ type: UpdateLeadDto }),
    ApiResponse({
      status: 200,
      description: 'Lead updated successfully',
      schema: {
        example: {
          message: LEADS_MESSAGES.LEAD_UPDATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            contactId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            title: 'Updated title',
            description: 'Updated desc',
            ownerId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            assignedBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            source: 'MANUAL',
            stage: 'NEW',
            createdBy: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
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
          path: '/api/v1/leads/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: LEADS_ERRORS.USER_NO_ORG,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Lead, Contact, or Owner not found',
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
