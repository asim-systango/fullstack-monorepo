import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import {
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
 * Apps/api interceptor wraps anything that isn't already { data } into { data: original }.
 * Controllers return { message, data }, so interceptor wraps again: { data: { message, data } }.
 * This function unwraps until the result no longer has a top-level 'data' key,
 * or the inner 'data' is an object with the actual entity fields (has 'id').
 */
function extractData<T>(payload: unknown): T {
    let current: unknown = payload;

    while (
        current !== null &&
        typeof current === 'object' &&
        'data' in current
    ) {
        const inner = (current as { data: unknown }).data;
        // If inner itself has 'data' key, keep unwrapping (double-wrapped)
        // But stop if inner has an 'id' field (it's the actual entity)
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
        const response = await apiClient.get<any>(API_ENDPOINTS.LEADS.GET_ALL, { params });
        const extracted = extractData<any>(response.data);

        if (Array.isArray(extracted)) {
            return {
                data: extracted,
                total: extracted.length,
                page: params?.page || 1,
                limit: params?.limit || 10,
                totalPages: 1,
            };
        }

        return {
            data: extracted?.data || [],
            total: extracted?.total || 0,
            page: extracted?.page || params?.page || 1,
            limit: extracted?.limit || params?.limit || 10,
            totalPages: extracted?.totalPages || 1,
        };
    },

    getLeadDetails: async (id: string): Promise<Lead> => {
        const response = await apiClient.get<any>(API_ENDPOINTS.LEADS.GET_DETAILS(id));
        return extractData<Lead>(response.data);
    },

    createLead: async (payload: CreateLeadPayload): Promise<Lead> => {
        const response = await apiClient.post<any>(API_ENDPOINTS.LEADS.CREATE, payload);
        return extractData<Lead>(response.data);
    },

    updateLead: async (id: string, payload: UpdateLeadPayload): Promise<Lead> => {
        const response = await apiClient.patch<any>(API_ENDPOINTS.LEADS.UPDATE(id), payload);
        return extractData<Lead>(response.data);
    },

    updateLeadStage: async (id: string, payload: UpdateLeadStagePayload): Promise<Lead> => {
        const response = await apiClient.patch<any>(API_ENDPOINTS.LEADS.UPDATE_STAGE(id), payload);
        return extractData<Lead>(response.data);
    },
};
