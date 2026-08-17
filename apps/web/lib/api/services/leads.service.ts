import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
    GetLeadsParams,
    Lead,
    CreateLeadPayload,
    UpdateLeadPayload,
    UpdateLeadStagePayload,
} from '../types/leads.types';

export interface PaginatedLeadsResponse {
    data: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Recursively unwrap NestJS response envelopes.
 */
function extractData<T>(payload: unknown): T {
    let current: unknown = payload;

    while (
        current !== null &&
        typeof current === 'object' &&
        'data' in current
    ) {
        const inner = (current as { data: unknown }).data;
        if (
            inner !== null &&
            typeof inner === 'object' &&
            'id' in (inner as object)
        ) {
            return inner as T;
        }
        current = inner;
    }

    return current as T;
}

export const leadsService = {
    getLeads: async (params?: GetLeadsParams): Promise<PaginatedLeadsResponse> => {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.LEADS.GET_ALL, { params });
        const extracted = extractData<PaginatedLeadsResponse | Lead[]>(response.data);

        if (Array.isArray(extracted)) {
            return {
                data: extracted,
                total: extracted.length,
                page: params?.page || 1,
                limit: params?.limit || 10,
                totalPages: 1,
            };
        }

        const paginated = extracted as PaginatedLeadsResponse | undefined;
        return {
            data: paginated?.data || [],
            total: paginated?.total || 0,
            page: paginated?.page || params?.page || 1,
            limit: paginated?.limit || params?.limit || 10,
            totalPages: paginated?.totalPages || 1,
        };
    },

    getLeadDetails: async (id: string): Promise<Lead> => {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.LEADS.GET_DETAILS(id));
        return extractData<Lead>(response.data);
    },

    createLead: async (payload: CreateLeadPayload): Promise<Lead> => {
        const response = await apiClient.post<unknown>(API_ENDPOINTS.LEADS.CREATE, payload);
        return extractData<Lead>(response.data);
    },

    updateLead: async (id: string, payload: UpdateLeadPayload): Promise<Lead> => {
        const response = await apiClient.patch<unknown>(API_ENDPOINTS.LEADS.UPDATE(id), payload);
        return extractData<Lead>(response.data);
    },

    updateLeadStage: async (id: string, payload: UpdateLeadStagePayload): Promise<Lead> => {
        const response = await apiClient.patch<unknown>(API_ENDPOINTS.LEADS.UPDATE_STAGE(id), payload);
        return extractData<Lead>(response.data);
    },
};
