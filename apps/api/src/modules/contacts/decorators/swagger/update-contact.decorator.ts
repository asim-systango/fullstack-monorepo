import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateContactDto } from '../../dto/update-contact.dto';
import { CONTACTS_ERRORS, CONTACTS_MESSAGES } from '../../constants/contacts.constants';

export function SwaggerUpdateContact() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update an existing contact',
      description:
        'Updates a contact within the same organization as the authenticated user.',
    }),
    ApiParam({
      name: 'id',
      description: 'The ID of the contact to update',
      type: String,
    }),
    ApiBody({ type: UpdateContactDto }),
    ApiResponse({
      status: 200,
      description: 'Contact updated successfully',
      schema: {
        example: {
          message: CONTACTS_MESSAGES.CONTACT_UPDATED,
          data: {
            id: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            organizationId: '01K3RG6NZZNHQ3WVCYX6HKYQFY',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            status: 'ACTIVE',
            source: 'MANUAL',
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
          path: '/api/v1/contacts/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: CONTACTS_ERRORS.USER_NO_ORG,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Contact not found',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/contacts/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: CONTACTS_ERRORS.CONTACT_NOT_FOUND,
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Contact with this email or phone already exists',
      schema: {
        example: {
          timestamp: '2026-08-06T19:00:00.000Z',
          path: '/api/v1/contacts/01K3RG6NZZNHQ3WVCYX6HKYQFY',
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
          path: '/api/v1/contacts/01K3RG6NZZNHQ3WVCYX6HKYQFY',
          error: CONTACTS_ERRORS.UNEXPECTED_ERROR,
        },
      },
    }),
  );
}
