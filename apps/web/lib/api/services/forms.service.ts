import { unwrapData } from '@shared/api-client';
import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  GetFormSubmissionsQuery,
  GetFormSubmissionsResponse,
  SubmitOnboardingRequestPayload,
  FormSubmissionStatus,
  FormSubmission,
} from '../types/forms.types';

export const formsApi = {
  submitOnboardingRequest: async (payload: SubmitOnboardingRequestPayload) => {
    const response = await apiClient.post(
      API_ENDPOINTS.FORMS.ONBOARDING_REQUEST,
      payload,
    );
    return unwrapData<{ message: string; submissionId: string }>(response.data);
  },

  getFormSubmissions: async (query?: GetFormSubmissionsQuery) => {
    const response = await apiClient.get<GetFormSubmissionsResponse>(
      API_ENDPOINTS.FORMS.SUBMISSIONS,
      {
        params: query,
      },
    );
    return unwrapData<GetFormSubmissionsResponse>(response.data);
  },

  updateSubmissionStatus: async (
    id: string,
    data: { status: FormSubmissionStatus; reviewNotes?: string },
  ) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.FORMS.SUBMISSION_STATUS(id),
      data,
    );
    return unwrapData<FormSubmission>(response.data);
  },
};
