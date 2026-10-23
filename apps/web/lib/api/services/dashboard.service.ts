import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { OverallKpis, WorkspaceKpis } from '../types/dashboard.types';

function extractData<T>(response: unknown): T {
  let curr = response as Record<string, unknown> | null;
  while (curr && typeof curr === 'object' && 'data' in curr && !('openLeadsCount' in curr) && !('organizations' in curr)) {
    curr = curr.data as Record<string, unknown>;
  }
  return curr as T;
}

export const dashboardApi = {
  async getOverallKpis(): Promise<OverallKpis> {
    const response = await apiClient.get<OverallKpis>(
      API_ENDPOINTS.DASHBOARD.OVERALL_KPIS,
    );
    return extractData<OverallKpis>(response.data);
  },

  async getCrmKpis(): Promise<WorkspaceKpis> {
    const response = await apiClient.get<WorkspaceKpis>(
      API_ENDPOINTS.DASHBOARD.CRM_KPIS,
    );
    return extractData<WorkspaceKpis>(response.data);
  },
};
