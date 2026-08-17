import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateOrganizationDto } from '../../dto/create-organization.dto';

export function CreateOrganizationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Onboard & Create New Organization',
      description:
        'Creates a new Organization, provisions the primary Org Admin user with a temporary password, and sends an invitation email.',
    }),
    ApiBody({ type: CreateOrganizationDto }),
    ApiResponse({
      status: 201,
      description: 'Organization created and Org Admin invitation sent successfully.',
      schema: {
        example: {
          organization: {
            id: '01J00000000000000000000ORG1',
            name: 'Acme Corporation',
            slug: 'acme-corporation',
            primaryDomain: 'acme.com',
            email: 'contact@acme.com',
            phone: '+1-555-0199',
            industry: 'Technology',
            status: 'ACTIVE',
            ownerId: '01J00000000000000000000USR2',
            createdAt: 1756490000000,
          },
          adminUser: {
            id: '01J00000000000000000000USR2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@acme.com',
            role: 'ORG_ADMIN',
            isPasswordChangeRequired: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed for request parameters.',
    }),
    ApiResponse({
      status: 409,
      description: 'Organization domain, slug, or Admin email already exists in system.',
    }),
  );
}
