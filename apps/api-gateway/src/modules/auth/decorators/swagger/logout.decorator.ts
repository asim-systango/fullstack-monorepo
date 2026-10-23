import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function LogoutSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'User Logout',
      description:
        'Clears the httpOnly access_token cookie, effectively logging the user out of the browser session.',
    }),
    ApiResponse({
      status: 200,
      description: 'Logout successful. Cookie cleared.',
      schema: {
        example: {
          message: 'Logged out successfully',
        },
      },
    }),
  );
}
