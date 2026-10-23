import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import { extractData } from '../utils/extract-data';
import type {
    Activity,
    CreateActivityPayload,
    UpdateActivityPayload,
} from '../types/activities.types';


export const activitiesService = {
    getAllActivities: async (): Promise<Activity[]> => {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.ACTIVITIES.GET_ALL);
        const extracted = extractData<Activity[] | { data: Activity[] }>(response.data);
        return Array.isArray(extracted) ? extracted : extracted?.data || [];
    },

    createActivity: async (payload: CreateActivityPayload): Promise<Activity> => {
        const response = await apiClient.post<unknown>(API_ENDPOINTS.ACTIVITIES.CREATE, payload);
        return extractData<Activity>(response.data);
    },

    updateActivity: async (id: string, payload: UpdateActivityPayload): Promise<Activity> => {
        const response = await apiClient.patch<unknown>(API_ENDPOINTS.ACTIVITIES.UPDATE(id), payload);
        return extractData<Activity>(response.data);
    },
};
