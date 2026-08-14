import { unwrapData } from '@shared/api-client';
import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { OverallKpis } from '../types/dashboard.types';

export const dashboardApi = {
  async getOverallKpis(): Promise<OverallKpis> {
    const response = await apiClient.get<OverallKpis>(
      API_ENDPOINTS.DASHBOARD.OVERALL_KPIS,
    );
    return unwrapData<OverallKpis>(response.data);
  },
};
