import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function InviteUserSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Invite a new user to the organization',
      description:
        'Allows an authorized user (e.g. ORG_ADMIN, SALES_LEAD) to invite a new member to their organization. Generates a temporary password and sends an invitation email.',
    }),
    ApiResponse({
      status: 201,
      description: 'User successfully invited.',
      schema: {
        example: {
          message: 'User invited successfully',
          userId: '01KZR9XGXDEJ1734GYGR1QCA5X',
        },
      },
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden - Not authorized to invite this role or user is not in an organization.',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - A user with this email already exists.',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation error on request body.',
    }),
  );
}
