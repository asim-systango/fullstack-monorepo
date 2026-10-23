import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardOrganizationDto } from '../../dto/onboard-organization.dto';
import { ORGANIZATION_ERRORS } from '../../constants/organization.constants';

export function OnboardOrganizationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Onboard a new Enterprise Organization',
      description:
        'Creates a new Organization record, provisions the primary Organization Administrator user account with a temporary password, and dispatches an onboarding invitation email.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: OnboardOrganizationDto }),
    ApiResponse({
      status: 201,
      description: 'Organization successfully onboarded and Org Admin account created.',
      schema: {
        example: {
          organization: {
            id: '01J00000000000000000000ORG1',
            name: 'Acme Technologies Inc',
            slug: 'acme-technologies-inc',
            primaryDomain: 'acme.com',
            email: 'contact@acme.com',
            phone: '+1-555-0199',
            industry: 'Software & Technology',
            status: 'ACTIVE',
            ownerId: '01J00000000000000000000USR2',
            createdAt: 1756490000000,
          },
          adminUser: {
            id: '01J00000000000000000000USR2',
            firstName: 'Alexander',
            lastName: 'Wright',
            email: 'alex.wright@acme.com',
            role: 'ORG_ADMIN',
            isPasswordChangeRequired: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request / Validation Failure',
      schema: {
        example: {
          timestamp: '2026-08-07T12:00:00.000Z',
          path: '/api/v1/organizations/onboard',
          error: ORGANIZATION_ERRORS.INVALID_ORGANIZATION_NAME,
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict / Entity Already Exists',
      schema: {
        example: {
          timestamp: '2026-08-07T12:00:00.000Z',
          path: '/api/v1/organizations/onboard',
          error: ORGANIZATION_ERRORS.DOMAIN_ALREADY_EXISTS,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        example: {
          timestamp: '2026-08-07T12:00:00.000Z',
          path: '/api/v1/organizations/onboard',
          error: ORGANIZATION_ERRORS.UNEXPECTED_ERROR,
        },
      },
    }),
  );
}
