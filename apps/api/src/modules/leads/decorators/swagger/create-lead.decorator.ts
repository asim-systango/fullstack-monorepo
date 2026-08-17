import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateLeadDto } from '../../dto/create-lead.dto';
import { LEADS_ERRORS, LEADS_MESSAGES } from '../../constants/leads.constants';

export function SwaggerCreateLead() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new lead',
      description:
        'Creates a new lead associated with a contact in the same organization.',
    }),
    ApiBody({ type: CreateLeadDto }),
    ApiResponse({
      status: 201,
      description: 'Lead created successfully',
      schema: {
        example: {
          message: LEADS_MESSAGES.LEAD_CREATED,
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
          path: '/api/v1/leads',
          error: LEADS_ERRORS.USER_NO_ORG,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Contact or Owner not found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/leads',
          error: LEADS_ERRORS.CONTACT_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/leads',
          error: LEADS_ERRORS.UNEXPECTED_ERROR,
        },
      },
    }),
  );
}
