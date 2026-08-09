'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Product } from './use-products';
import type { StockMovement } from './use-movements';

export type DashboardMetrics = {
  totalProducts: number;
  totalWarehouses: number;
  totalStockUnits: number;
  lowStockCount: number;
  lowStockItems: Product[];
  recentMovements: StockMovement[];
};

// Function to get the dashboaed details

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await apiClient.get<{ data: DashboardMetrics }>('/dashboard/metrics');
  return response.data.data;
}

// Tanstack query to use the function to get the dashboard details

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000,
  });
}
