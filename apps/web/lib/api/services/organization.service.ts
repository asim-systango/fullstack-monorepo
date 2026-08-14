import { unwrapData } from '@shared/api-client';
import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { OnboardOrganizationPayload } from '@shared/types';
import type {
  GetOrganizationsQuery,
  GetOrganizationsResponse,
} from '../types/organization.types';

export const organizationsApi = {
  async onboard(payload: OnboardOrganizationPayload) {
    const response = await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.ONBOARD, payload);
    return unwrapData(response.data);
  },

  async getOrganizations(
    query: GetOrganizationsQuery = {},
  ): Promise<GetOrganizationsResponse> {
    const response = await apiClient.get<GetOrganizationsResponse>(
      API_ENDPOINTS.ORGANIZATIONS.GET_ALL,
      {
        params: query,
      },
    );
    return unwrapData<GetOrganizationsResponse>(response.data);
  },
};
