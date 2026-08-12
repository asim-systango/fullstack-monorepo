import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function UpdateFormSubmissionStatusSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update form submission status (Super Admin only)',
      description:
        'Updates the status of a form submission (e.g. IN_REVIEW, APPROVED, REJECTED) and automatically sends an email notification to the submitter. Requires update:form-submissions permission.',
    }),
    ApiParam({
      name: 'id',
      description: 'ULID of the form submission to update',
      example: '01KZR9XGXDEJ1734GYGR1QCA5X',
    }),
    ApiResponse({
      status: 200,
      description:
        'Form submission status updated successfully and notification email sent',
      schema: {
        example: {
          message: 'Form submission status updated successfully to IN_REVIEW',
          submission: {
            id: '01KZR9XGXDEJ1734GYGR1QCA5X',
            status: 'IN_REVIEW',
            reviewedBy: '01J00000000000000000000U01',
            reviewNotes: 'Under initial compliance review.',
            reviewedAt: 1786386600000,
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Form submission request not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing bearer token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - User does not have update:form-submissions permission',
    }),
  );
}
