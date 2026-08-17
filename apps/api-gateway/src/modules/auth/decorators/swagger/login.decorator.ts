import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from '../../dto/login.dto';
import { AUTH_ERRORS } from '../../constants/auth.constants';

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'User Authentication / Login',
      description:
        'Authenticates a user via email and password, validates user and organization status, sets httpOnly access_token cookie, and returns JWT access token along with tenant context (organization slug, domain) and user profile details.',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description:
        'Login successful. Returns JWT token, sets httpOnly cookie, and tenant context.',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          tokenType: 'Bearer',
          expiresIn: '7d',
          user: {
            id: '01J00000000000000000000USR2',
            firstName: 'Alexander',
            lastName: 'Wright',
            email: 'alex.wright@acme.com',
            role: 'ORG_ADMIN',
            isPasswordChangeRequired: true,
          },
          organization: {
            id: '01J00000000000000000000ORG1',
            name: 'Acme Technologies Inc',
            slug: 'acme-technologies-inc',
            primaryDomain: 'acme.com',
            logoUrl: null,
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized / Invalid Credentials',
      schema: {
        example: {
          timestamp: '2026-08-10T12:00:00.000Z',
          path: '/auth/login',
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden / Account or Organization Inactive',
      schema: {
        example: {
          timestamp: '2026-08-10T12:00:00.000Z',
          path: '/auth/login',
          error: AUTH_ERRORS.USER_INACTIVE,
        },
      },
    }),
  );
}
