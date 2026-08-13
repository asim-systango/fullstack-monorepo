import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateContactDto } from '../../dto/create-contact.dto';

export function SwaggerCreateContact() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new contact',
      description:
        'Creates a new contact within the same organization as the authenticated user.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: CreateContactDto }),
    ApiResponse({
      status: 201,
      description: 'Contact created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Contact with this email or phone already exists',
    }),
  );
}
