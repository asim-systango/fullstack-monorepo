import { unwrapData } from '@shared/api-client';
import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
    GetUsersQuery,
    GetUsersResponse,
    InviteUserPayload,
    InviteUserResponse,
} from '../types/users.types';

export const usersApi = {
    async getUsers(query: GetUsersQuery = {}): Promise<GetUsersResponse> {
        const response = await apiClient.get<GetUsersResponse>(API_ENDPOINTS.USERS.GET_ALL, {
            params: query,
        });
        return unwrapData<GetUsersResponse>(response.data);
    },

    async inviteUser(payload: InviteUserPayload): Promise<InviteUserResponse> {
        const response = await apiClient.post<InviteUserResponse>(
            API_ENDPOINTS.USERS.INVITE,
            payload,
        );
        return unwrapData<InviteUserResponse>(response.data);
    },
};
