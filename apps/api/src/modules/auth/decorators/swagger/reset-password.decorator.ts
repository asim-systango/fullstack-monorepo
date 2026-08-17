import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ResetPasswordDto } from '../../dto/reset-password.dto';
import { AUTH_ERRORS, AUTH_MESSAGES } from '../../constants/auth.constants';

export function ResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reset Password via Token',
      description:
        'Verifies the password reset token issued via email or first-time login, updates user password hash, and marks password change requirement as completed.',
    }),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Password reset successfully.',
      schema: {
        example: {
          message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid or Expired Reset Token',
      schema: {
        example: {
          timestamp: '2026-08-10T12:00:00.000Z',
          path: '/api/v1/auth/reset-password',
          error: AUTH_ERRORS.INVALID_RESET_TOKEN,
        },
      },
    }),
  );
}
