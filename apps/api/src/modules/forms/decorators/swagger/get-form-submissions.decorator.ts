import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetFormSubmissionsSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get paginated list of form submissions (Super Admin only)',
      description:
        'Retrieves a paginated list of form submissions with support for searching by contact name, email, company name, and filtering by form type or status. Requires read:form-submissions permission (Super Admin role).',
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated form submissions list returned successfully',
      schema: {
        example: {
          data: [
            {
              id: '01KZR9XGXDEJ1734GYGR1QCA5X',
              formType: 'ORGANIZATION_ONBOARDING_REQUEST',
              status: 'PENDING',
              contactName: 'Harsh Vyas',
              email: 'harsh.vyas@systango.com',
              phone: '+1 555-0192',
              companyName: 'Systango Technologies',
              companySize: '51-200',
              industry: 'Information Technology',
              website: 'https://systango.com',
              message: 'Interested in CRM onboarding',
              createdAt: '1786386600000',
              updatedAt: '1786386600000',
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
      description: 'Forbidden - User does not have read:form-submissions permission',
    }),
  );
}
