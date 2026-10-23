'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { StockMovement } from './use-movements';

export interface DashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalStockUnits: number;
  totalMonthlyMovements: number;
  totalLowStockItems: number;
  recentMovements: StockMovement[];
  scopedWarehouse?: {
    id: string;
    name: string;
    code: string;
    location: string;
  } | null;
}

export interface ChartSegment {
  id?: string;
  label: string;
  value: number;
  color?: string;
  subtext?: string;
  type?: string;
  status?: string;
}

// 1. Fetch KPI metrics
export async function fetchDashboardMetrics(
  warehouseId?: string,
): Promise<DashboardMetrics> {
  const url = warehouseId
    ? `/dashboard/metrics?warehouseId=${encodeURIComponent(warehouseId)}`
    : '/dashboard/metrics';
  const response = await apiClient.get<{ data: DashboardMetrics }>(url);
  return response.data.data;
}

export function useDashboardMetrics(warehouseId?: string) {
  return useQuery({
    queryKey: ['dashboard-metrics', warehouseId],
    queryFn: () => fetchDashboardMetrics(warehouseId),
    refetchInterval: 30000,
  });
}

// 2. Fetch Category Stock Chart Data
export async function fetchCategoryStockChart(
  warehouseId?: string,
): Promise<ChartSegment[]> {
  const url = warehouseId
    ? `/dashboard/charts/category-stock?warehouseId=${encodeURIComponent(warehouseId)}`
    : '/dashboard/charts/category-stock';
  const response = await apiClient.get<{ data: ChartSegment[] }>(url);
  return response.data.data;
}

export function useCategoryStockChart(warehouseId?: string) {
  return useQuery({
    queryKey: ['dashboard-chart-category-stock', warehouseId],
    queryFn: () => fetchCategoryStockChart(warehouseId),
    refetchInterval: 30000,
  });
}

// 3. Fetch Warehouse Stock Distribution Chart Data (Admin Only)
export async function fetchWarehouseStockChart(): Promise<ChartSegment[]> {
  const response = await apiClient.get<{ data: ChartSegment[] }>(
    '/dashboard/charts/warehouse-stock',
  );
  return response.data.data;
}

export function useWarehouseStockChart(enabled = true) {
  return useQuery({
    queryKey: ['dashboard-chart-warehouse-stock'],
    queryFn: fetchWarehouseStockChart,
    enabled,
    refetchInterval: 30000,
  });
}

// 4. Fetch Monthly Movements Chart Data
export async function fetchMonthlyMovementsChart(
  warehouseId?: string,
  days = 30,
): Promise<ChartSegment[]> {
  const params = new URLSearchParams();
  if (warehouseId) params.append('warehouseId', warehouseId);
  if (days) params.append('days', String(days));

  const qs = params.toString();
  const url = qs
    ? `/dashboard/charts/monthly-movements?${qs}`
    : '/dashboard/charts/monthly-movements';
  const response = await apiClient.get<{ data: ChartSegment[] }>(url);
  return response.data.data;
}

export function useMonthlyMovementsChart(warehouseId?: string, days = 30) {
  return useQuery({
    queryKey: ['dashboard-chart-monthly-movements', warehouseId, days],
    queryFn: () => fetchMonthlyMovementsChart(warehouseId, days),
    refetchInterval: 30000,
  });
}

// 5. Fetch Stock Health Chart Data
export async function fetchStockHealthChart(
  warehouseId?: string,
  threshold = 5,
): Promise<ChartSegment[]> {
  const params = new URLSearchParams();
  if (warehouseId) params.append('warehouseId', warehouseId);
  if (threshold) params.append('threshold', String(threshold));

  const qs = params.toString();
  const url = qs
    ? `/dashboard/charts/stock-health?${qs}`
    : '/dashboard/charts/stock-health';
  const response = await apiClient.get<{ data: ChartSegment[] }>(url);
  return response.data.data;
}

export function useStockHealthChart(warehouseId?: string, threshold = 5) {
  return useQuery({
    queryKey: ['dashboard-chart-stock-health', warehouseId, threshold],
    queryFn: () => fetchStockHealthChart(warehouseId, threshold),
    refetchInterval: 30000,
  });
}
