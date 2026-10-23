'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  location?: string;
  totalStockUnits?: number;
  totalSkusCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type StockLevel = {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    sku: string;
    name: string;
    unit: string;
    lowStockThreshold: number;
  };
};

export type CreateWarehouseInput = {
  code: string;
  name: string;
  location?: string;
};

export type UpdateWarehouseInput = Partial<CreateWarehouseInput>;

// Function to get the ware house details 1

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const response = await apiClient.get<{ data: Warehouse[] }>('/warehouses');
  return response.data.data;
}

export async function fetchWarehouseById(id: string): Promise<Warehouse> {
  const response = await apiClient.get<{ data: Warehouse }>(`/warehouses/${id}`);
  return response.data.data;
}

export async function createWarehouse(input: CreateWarehouseInput): Promise<Warehouse> {
  const response = await apiClient.post<{ data: Warehouse }>('/warehouses', input);
  return response.data.data;
}

export async function updateWarehouse(
  id: string,
  data: UpdateWarehouseInput,
): Promise<Warehouse> {
  const response = await apiClient.patch<{ data: Warehouse }>(`/warehouses/${id}`, data);
  return response.data.data;
}

// tanstack query to call teh ware house api to get teh details

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => fetchWarehouseById(id),
    enabled: Boolean(id),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseInput }) =>
      updateWarehouse(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      void queryClient.invalidateQueries({ queryKey: ['warehouses', variables.id] });
    },
  });
}
