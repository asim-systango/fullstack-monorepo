import { UserRole } from '@/lib/auth/roles';

export interface UserResult {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleName: UserRole | string | null;
    status: string;
    isPasswordChangeRequired: boolean;
    lastLoginAt: number | null;
    createdAt: number;
    organizationId?: string;
    organizationName?: string;
}

export interface GetUsersQuery {
    organizationId?: string;
    search?: string;
    roleName?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface GetUsersResponse {
    data: UserResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface InviteUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    roleName: string;
}

export interface InviteUserResponse {
    message: string;
    userId: string;
}
