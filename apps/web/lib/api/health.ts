import { apiClient } from '@/lib/api';

export async function fetchHealth(): Promise<{ status: string }> {
  const { data } = await apiClient.get<{ status: string }>('/health');
  return data;
}
