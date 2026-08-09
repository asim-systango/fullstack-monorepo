'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export type MovementType = 'inbound' | 'outbound' | 'adjustment';

export type StockMovement = {
  id: string;
  warehouseId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  userId?: string;
  createdAt: string;
  warehouse?: {
    id: string;
    code: string;
    name: string;
  };
  product?: {
    id: string;
    sku: string;
    name: string;
    unit: string;
  };
  user?: {
    id: string;
    email: string;
    name?: string;
  };
};

export type MovementQueryParams = {
  warehouseId?: string;
  productId?: string;
  sku?: string;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
};

export type RecordMovementInput = {
  warehouseId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  userId?: string;
};

/// Function to get the stock movement details

export async function fetchMovements(
  params?: MovementQueryParams,
): Promise<StockMovement[]> {
  const searchParams = new URLSearchParams();
  if (params?.warehouseId) searchParams.set('warehouseId', params.warehouseId);
  if (params?.productId) searchParams.set('productId', params.productId);
  if (params?.sku) searchParams.set('sku', params.sku);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
  if (params?.dateTo) searchParams.set('dateTo', params.dateTo);

  const response = await apiClient.get<{ data: StockMovement[] }>(
    `/movements?${searchParams.toString()}`,
  );
  return response.data.data;
}

export async function recordMovement(input: RecordMovementInput): Promise<StockMovement> {
  const response = await apiClient.post<{ data: StockMovement }>('/movements', input);
  return response.data.data;
}

// Tasnsstck query to get the stock details

export function useMovements(params?: MovementQueryParams) {
  return useQuery({
    queryKey: ['movements', params],
    queryFn: () => fetchMovements(params),
  });
}

export function useRecordMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordMovement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['movements'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
