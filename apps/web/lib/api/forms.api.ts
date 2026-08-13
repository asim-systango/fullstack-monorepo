import { apiClient } from '../api';
import { unwrapData } from '@shared/api-client';

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

export const formsApi = {
  submitOnboardingRequest: async (payload: SubmitOnboardingRequestPayload) => {
    const baseURL = apiClient.defaults.baseURL || '';
    const endpoint = baseURL.endsWith('/v1')
      ? '/forms/onboarding-request'
      : '/v1/forms/onboarding-request';
    const response = await apiClient.post(endpoint, payload);
    return unwrapData<{ message: string; submissionId: string }>(response.data);
  },

  getFormSubmissions: async (query?: GetFormSubmissionsQuery) => {
    const baseURL = apiClient.defaults.baseURL || '';
    const endpoint = baseURL.endsWith('/v1')
      ? '/forms/submissions'
      : '/v1/forms/submissions';
    const response = await apiClient.get<GetFormSubmissionsResponse>(endpoint, {
      params: query,
    });
    return unwrapData<GetFormSubmissionsResponse>(response.data);
  },

  updateSubmissionStatus: async (
    id: string,
    data: { status: FormSubmissionStatus; reviewNotes?: string },
  ) => {
    const baseURL = apiClient.defaults.baseURL || '';
    const endpoint = baseURL.endsWith('/v1')
      ? `/forms/submissions/${id}/status`
      : `/v1/forms/submissions/${id}/status`;
    const response = await apiClient.patch(endpoint, data);
    return unwrapData<FormSubmission>(response.data);
  },
};
