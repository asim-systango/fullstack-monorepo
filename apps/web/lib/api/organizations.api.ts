import { apiClient } from '../api';
import { unwrapData } from '@shared/api-client';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isPasswordChangeRequired: boolean;
}

export interface OrganizationResult {
  id: string;
  name: string;
  slug: string;
  primaryDomain: string;
  email: string;
  phone: string;
  industry: string;
  logoUrl: string | null;
  website: string | null;
  address: string | null;
  timezone: string;
  status: string;
  ownerId: string | null;
  usersCount: number;
  adminUser: AdminUser | null;
  createdAt: number;
  updatedAt: number;
}

export interface GetOrganizationsResponse {
  data: OrganizationResult[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetOrganizationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const organizationsApi = {
  async getOrganizations(
    query: GetOrganizationsQuery = {},
  ): Promise<GetOrganizationsResponse> {
    const baseURL = apiClient.defaults.baseURL || '';
    const endpoint = baseURL.endsWith('/v1') ? '/organizations' : '/v1/organizations';

    const response = await apiClient.get<GetOrganizationsResponse>(endpoint, {
      params: query,
    });
    return unwrapData<GetOrganizationsResponse>(response.data);
  },
};
