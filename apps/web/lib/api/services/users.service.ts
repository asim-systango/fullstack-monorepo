import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
    GetUsersQuery,
    GetUsersResponse,
    InviteUserPayload,
    InviteUserResponse,
} from '../types/users.types';

function extractData<T>(payload: unknown): T {
    if (payload !== null && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
}

export const usersApi = {
    async getUsers(query: GetUsersQuery = {}): Promise<GetUsersResponse> {
        const response = await apiClient.get<GetUsersResponse>(API_ENDPOINTS.USERS.GET_ALL, {
            params: query,
        });
        return extractData<GetUsersResponse>(response.data);
    },

    async inviteUser(payload: InviteUserPayload): Promise<InviteUserResponse> {
        const response = await apiClient.post<InviteUserResponse>(
            API_ENDPOINTS.USERS.INVITE,
            payload,
        );
        return extractData<InviteUserResponse>(response.data);
    },
};
