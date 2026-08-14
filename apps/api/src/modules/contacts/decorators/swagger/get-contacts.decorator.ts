import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CONTACTS_ERRORS, CONTACTS_MESSAGES } from '../../constants/contacts.constants';

export function SwaggerGetContacts() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get all contacts',
      description: 'Retrieve a paginated list of contacts for the organization.',
    }),
    ApiQuery({ name: 'organizationId', required: false, type: String }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({
      name: 'source',
      required: false,
      enum: ['WEBSITE', 'MANUAL', 'IMPORT', 'API', 'REFERRAL'],
    }),
    ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'] }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved contacts.',
      schema: {
        example: {
          message: CONTACTS_MESSAGES.CONTACTS_RETRIEVED,
          data: [
            {
              id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
            },
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
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
          path: '/api/v1/contacts',
          error: CONTACTS_ERRORS.USER_NO_ORG,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/contacts',
          error: CONTACTS_ERRORS.UNEXPECTED_ERROR,
        },
      },
    }),
  );
}
