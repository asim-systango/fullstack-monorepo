import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ChangePasswordDto } from '../../dto/change-password.dto';
import { AUTH_ERRORS, AUTH_MESSAGES } from '../../constants/auth.constants';

export function ChangePasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Change Password (Authenticated)',
      description:
        'Allows an authenticated user to change their password by verifying their current password.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: ChangePasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Password changed successfully.',
      schema: {
        example: {
          message: AUTH_MESSAGES.PASSWORD_CHANGED_SUCCESS,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid current password',
      schema: {
        example: {
          timestamp: '2026-08-10T12:00:00.000Z',
          path: '/api/v1/auth/change-password',
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
        },
      },
    }),
  );
}
