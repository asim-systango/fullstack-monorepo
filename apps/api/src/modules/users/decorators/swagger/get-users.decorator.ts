import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RoleName } from '../../../../database/entities/role.entity';

export function GetUsersSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a paginated list of users',
      description:
        "Retrieves a list of users based on the requester's role. Super Admins can fetch users for any organization, Org Admins can fetch all users in their organization, Sales Leads can fetch Sales Reps, and Sales Reps can only view themselves.",
    }),
    ApiQuery({ name: 'organizationId', required: false, type: String }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({ name: 'roleName', required: false, enum: RoleName }),
    ApiQuery({ name: 'status', required: false, type: String }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: 200,
      description: 'Successfully fetched users.',
      schema: {
        example: {
          data: [
            {
              id: 'user_id',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              roleName: 'SALES_REP',
              status: 'ACTIVE',
              isPasswordChangeRequired: false,
              lastLoginAt: 1234567890,
              createdAt: 1234567890,
              organizationId: 'org_id',
              organizationName: 'Systango',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized.',
    }),
  );
}
