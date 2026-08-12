import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function SubmitOnboardingRequestSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Public endpoint to submit organization onboarding request',
      description:
        'Allows a prospective company to submit an onboarding request to access the CRM platform. Includes multi-layer checks for spam throttling, duplicate active request detection, and existing organization validation.',
    }),
    ApiResponse({
      status: 201,
      description: 'Onboarding request submitted successfully',
      schema: {
        example: {
          message:
            'Your organization onboarding request has been submitted successfully. Our team will review it shortly.',
          submissionId: '01KZR9XGXDEJ1734GYGR1QCA5X',
        },
      },
    }),
    ApiResponse({
      status: 409,
      description:
        'Conflict - Active request already exists, organization already onboarded, or too many submission attempts from email',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation error on request body',
    }),
  );
}
