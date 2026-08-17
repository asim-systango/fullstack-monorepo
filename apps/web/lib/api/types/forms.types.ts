export type FormType = 'ORGANIZATION_ONBOARDING_REQUEST' | 'CONTACT_US' | 'DEMO_REQUEST';
export type FormSubmissionStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface FormSubmission {
  id: string;
  formType: FormType;
  status: FormSubmissionStatus;
  contactName: string;
  email: string;
  phone?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  reviewedBy?: string;
  reviewNotes?: string;
  reviewedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface GetFormSubmissionsResponse {
  data: FormSubmission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetFormSubmissionsQuery {
  page?: number;
  limit?: number;
  formType?: FormType;
  status?: FormSubmissionStatus;
  search?: string;
}

export interface SubmitOnboardingRequestPayload {
  contactName: string;
  email: string;
  companyName: string;
  phone?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  message?: string;
}
