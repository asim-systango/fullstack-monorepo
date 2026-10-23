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
