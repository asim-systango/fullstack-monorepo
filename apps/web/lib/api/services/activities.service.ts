import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
    Activity,
    CreateActivityPayload,
    UpdateActivityPayload,
} from '../types/activities.types';

function extractData<T>(payload: unknown): T {
    if (payload !== null && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data;
    }
    return payload as T;
}

export const activitiesService = {
    getAllActivities: async (): Promise<Activity[]> => {
        const response = await apiClient.get<any>(API_ENDPOINTS.ACTIVITIES.GET_ALL);
        const extracted = extractData<any>(response.data);
        return Array.isArray(extracted) ? extracted : extracted?.data || [];
    },

    createActivity: async (payload: CreateActivityPayload): Promise<Activity> => {
        const response = await apiClient.post<any>(API_ENDPOINTS.ACTIVITIES.CREATE, payload);
        return extractData<Activity>(response.data);
    },

    updateActivity: async (id: string, payload: UpdateActivityPayload): Promise<Activity> => {
        const response = await apiClient.patch<any>(API_ENDPOINTS.ACTIVITIES.UPDATE(id), payload);
        return extractData<Activity>(response.data);
    },
};
