import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ForgotPasswordDto } from '../../dto/forgot-password.dto';
import { AUTH_MESSAGES } from '../../constants/auth.constants';

export function ForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Request Password Reset Email',
      description:
        'Generates a secure password reset token and sends an email containing the password reset link to the user.',
    }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Password reset email sent (or generic success message for security).',
      schema: {
        example: {
          message: AUTH_MESSAGES.FORGOT_PASSWORD_SENT,
        },
      },
    }),
  );
}
