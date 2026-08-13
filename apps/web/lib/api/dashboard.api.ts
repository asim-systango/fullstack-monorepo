import { apiClient } from '../api';
import { unwrapData } from '@shared/api-client';

export interface OverallKpis {
  organizations: {
    total: number;
    active: number;
  };
  platformUsers: {
    total: number;
    pendingInvites: number;
  };
  organizationRequests: {
    total: number;
    pending: number;
    inReview: number;
    approved: number;
    rejected: number;
  };
}

export const dashboardApi = {
  async getOverallKpis(): Promise<OverallKpis> {
    const baseURL = apiClient.defaults.baseURL || '';
    const endpoint = baseURL.endsWith('/v1')
      ? '/dashboard/overall-kpis'
      : '/v1/dashboard/overall-kpis';

    const response = await apiClient.get<OverallKpis>(endpoint);
    return unwrapData<OverallKpis>(response.data);
  },
};
