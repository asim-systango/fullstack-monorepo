import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function MeSwagger() {
  return applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({
      summary: 'Get Current User Profile',
      description:
        'Returns the authenticated user profile decoded from the httpOnly access_token cookie JWT.',
    }),
    ApiResponse({
      status: 200,
      description: 'Returns the current user profile from cookie JWT.',
      schema: {
        example: {
          id: '01J00000000000000000000USR2',
          email: 'alex.wright@acme.com',
          organizationId: '01J00000000000000000000ORG1',
          role: 'ORG_ADMIN',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid access_token cookie',
    }),
  );
}
