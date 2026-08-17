import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export function GetOrganizationsSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get paginated organizations list',
      description:
        'Retrieves a paginated list of organizations with optional search (by name, slug, domain, email) and status filters. Protected by RoutePermissionGuard (SUPER_ADMIN role). Includes total users count and admin user details.',
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of organizations retrieved successfully',
      schema: {
        example: {
          data: [
            {
              id: '01KZR9XGXDEJ1734GYGR1QCA5X',
              name: 'Systango',
              slug: 'systango',
              primaryDomain: 'systango.com',
              email: 'info@systango.com',
              phone: '+1 555-0192',
              industry: 'Technology',
              logoUrl: null,
              website: 'https://systango.com',
              address: 'London, UK',
              timezone: 'Asia/Kolkata',
              status: 'ACTIVE',
              ownerId: '01KZR9XH0BZW13V54FHWMD8CWJ',
              usersCount: 5,
              adminUser: {
                id: '01KZR9XH0BZW13V54FHWMD8CWJ',
                firstName: 'Harsh',
                lastName: 'Vyas',
                email: 'harsh.vyas@systango.com',
                isPasswordChangeRequired: false,
              },
              createdAt: 1786454449000,
              updatedAt: 1786454449000,
            },
          ],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing bearer token',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden - User lacks required route permission for GET /api/v1/organizations',
    }),
  );
}
