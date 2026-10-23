'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { type StockMovement } from './use-movements';

export type CreateTransferInput = {
  sourceWarehouseId: string;
  destWarehouseId: string;
  productId: string;
  quantity: number;
  reason?: string;
};

export async function fetchTransfers(): Promise<StockMovement[]> {
  const response = await apiClient.get<{ data: StockMovement[] }>('/transfers');
  return response.data.data;
}

export async function createTransfer(
  input: CreateTransferInput,
): Promise<{ outbound: StockMovement; inbound: StockMovement }> {
  const response = await apiClient.post<{
    data: { outbound: StockMovement; inbound: StockMovement };
  }>('/transfers', input);
  return response.data.data;
}

export function useTransfers() {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: fetchTransfers,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transfers'] });
      void queryClient.invalidateQueries({ queryKey: ['movements'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
