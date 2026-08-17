import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
    GetDealsParams,
    Deal,
    CreateDealPayload,
    UpdateDealPayload,
    UpdateDealStagePayload,
} from '../types/deals.types';

export interface PaginatedDealsResponse {
    data: Deal[];
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

export const dealsService = {
    getDeals: async (params?: GetDealsParams): Promise<PaginatedDealsResponse> => {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.DEALS.GET_ALL, { params });
        const extracted = extractData<PaginatedDealsResponse | Deal[]>(response.data);

        if (Array.isArray(extracted)) {
            return {
                data: extracted,
                total: extracted.length,
                page: params?.page || 1,
                limit: params?.limit || 10,
                totalPages: 1,
            };
        }

        const paginated = extracted as PaginatedDealsResponse | undefined;
        return {
            data: paginated?.data || [],
            total: paginated?.total || 0,
            page: paginated?.page || params?.page || 1,
            limit: paginated?.limit || params?.limit || 10,
            totalPages: paginated?.totalPages || 1,
        };
    },

    getDealDetails: async (id: string): Promise<Deal> => {
        const response = await apiClient.get<unknown>(API_ENDPOINTS.DEALS.GET_DETAILS(id));
        return extractData<Deal>(response.data);
    },

    createDeal: async (payload: CreateDealPayload): Promise<Deal> => {
        const response = await apiClient.post<unknown>(API_ENDPOINTS.DEALS.CREATE, payload);
        return extractData<Deal>(response.data);
    },

    updateDeal: async (id: string, payload: UpdateDealPayload): Promise<Deal> => {
        const response = await apiClient.patch<unknown>(API_ENDPOINTS.DEALS.UPDATE(id), payload);
        return extractData<Deal>(response.data);
    },

    updateDealStage: async (id: string, payload: UpdateDealStagePayload): Promise<Deal> => {
        const response = await apiClient.patch<unknown>(API_ENDPOINTS.DEALS.UPDATE_STAGE(id), payload);
        return extractData<Deal>(response.data);
    },
};
