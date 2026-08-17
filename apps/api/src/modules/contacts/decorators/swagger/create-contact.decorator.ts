import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateContactDto } from '../../dto/create-contact.dto';
import { CONTACTS_ERRORS } from '../../constants/contacts.constants';

export function SwaggerCreateContact() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new contact',
      description:
        'Creates a new contact within the same organization as the authenticated user.',
    }),
    ApiBody({ type: CreateContactDto }),
    ApiResponse({
      status: 201,
      description: 'Contact created successfully',
      schema: {
        example: {
          message: 'Contact created successfully.',
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            status: 'ACTIVE',
            source: 'MANUAL',
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
          path: '/api/v1/contacts',
          error: CONTACTS_ERRORS.USER_NO_ORG,
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Contact already exists',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/contacts',
          error: CONTACTS_ERRORS.EMAIL_EXISTS,
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
