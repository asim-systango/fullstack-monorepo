'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth';
import { useWarehouses } from '@/lib/hooks/use-warehouses';
import {
  useDashboardMetrics,
  useCategoryStockChart,
  useWarehouseStockChart,
  useMonthlyMovementsChart,
  useStockHealthChart,
} from '@/lib/hooks/use-dashboard';
import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';
import { DashboardSkeleton } from '@/components/layout/page-skeleton';
import { RechartsPieChart } from '@/components/dashboard/recharts-pie-chart';
import { Button } from '@shared/ui';

function getMovementBadgeStyle(type: string): string {
  if (type === 'inbound') {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30';
  }
  if (type === 'outbound') {
    return 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30';
  }
  return 'bg-[#7DA0FA]/15 text-[#4747A1] dark:text-[#7DA0FA] border border-[#7DA0FA]/30';
}

function getMovementQuantityColor(type: string): string {
  if (type === 'inbound') return 'text-emerald-600';
  if (type === 'outbound') return 'text-red-600';
  return 'text-[#4747A1] dark:text-white';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Warehouses list for facility switcher
  const { data: warehouses = [], isLoading: isWarehousesLoading } = useWarehouses();

  // Active warehouse selection state
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  useEffect(() => {
    if (user?.warehouseId) {
      setSelectedWarehouseId(user.warehouseId);
    } else if (
      warehouses.length > 0 &&
      !selectedWarehouseId &&
      warehouses[0]?.id &&
      !isAdmin
    ) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [user?.warehouseId, warehouses, selectedWarehouseId, isAdmin]);

  const activeWarehouse = useMemo(() => {
    return (
      warehouses.find((w) => w.id === selectedWarehouseId) ||
      (selectedWarehouseId
        ? { id: selectedWarehouseId, name: 'Warehouse Hub', code: 'WH' }
        : null)
    );
  }, [warehouses, selectedWarehouseId]);

  // Target query ID for staff / filtered inspection
  const effectiveWarehouseId = selectedWarehouseId || undefined;

  // 1. Dedicated Backend API Hook for KPI Metrics
  const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetrics(
    isAdmin && !selectedWarehouseId ? undefined : effectiveWarehouseId,
  );

  // 2. Dedicated Backend API Hook for Category Stock Chart
  const { data: categoryStockData = [], isLoading: isCategoryLoading } =
    useCategoryStockChart(
      isAdmin && !selectedWarehouseId ? undefined : effectiveWarehouseId,
    );

  // 3. Dedicated Backend API Hook for Warehouse Stock Distribution (Admin Only)
  const { data: warehouseStockData = [], isLoading: isWarehouseChartLoading } =
    useWarehouseStockChart(isAdmin);

  // 4. Dedicated Backend API Hook for Monthly Movements Chart
  const { data: monthlyMovementsData = [], isLoading: isMovementsChartLoading } =
    useMonthlyMovementsChart(
      isAdmin && !selectedWarehouseId ? undefined : effectiveWarehouseId,
      30,
    );

  // 5. Dedicated Backend API Hook for Stock Health Status (Staff Sample / Scoped View)
  const { data: stockHealthData = [], isLoading: isHealthChartLoading } =
    useStockHealthChart(
      isAdmin && !selectedWarehouseId ? undefined : effectiveWarehouseId,
      5,
    );

  const isLoading =
    isMetricsLoading ||
    isWarehousesLoading ||
    isCategoryLoading ||
    (isAdmin && isWarehouseChartLoading) ||
    isMovementsChartLoading ||
    isHealthChartLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const totalStockUnits = metrics?.totalStockUnits ?? 0;
  const totalMonthlyMovements = metrics?.totalMonthlyMovements ?? 0;
  const totalLowStockItems = metrics?.totalLowStockItems ?? 0;
  const totalProducts = metrics?.totalProducts ?? 0;
  const recentMovements =
    (metrics?.recentMovements as unknown as Array<{
      id: string;
      type: string;
      quantity: number;
      createdAt: string;
      reason?: string;
      product?: { name?: string; sku?: string };
      warehouse?: { name?: string };
    }>) || [];

  return (
    <div className="space-y-8">
      {/* Unified Top Header */}
      <DashboardPageHeader
        badge={isAdmin ? 'Admin Intelligence' : 'Facility Operations'}
        subtag={
          isAdmin && !selectedWarehouseId
            ? 'Overall Enterprise Network'
            : `Facility: ${activeWarehouse?.name || 'Local Warehouse'}`
        }
        title="Executive Logistics Dashboard"
        description={
          isAdmin && !selectedWarehouseId
            ? 'Real-time overview of multi-warehouse inventory distribution, category stock allocation, and network fulfillment movements.'
            : `Live operational monitoring for ${activeWarehouse?.name || 'your assigned warehouse'} with category stock, monthly movements, and stock health status.`
        }
      >
        <HeaderStatCard
          label="Total Units"
          value={totalStockUnits.toLocaleString()}
          subtext="in stock"
          tone="primary"
          icon="📦"
        />
        <HeaderStatCard
          label="Monthly Actions"
          value={totalMonthlyMovements}
          subtext="logs"
          tone="success"
          icon="🔄"
        />
        <HeaderStatCard
          label="Critical Low"
          value={totalLowStockItems}
          subtext="SKUs"
          tone={totalLowStockItems > 0 ? 'danger' : 'neutral'}
          icon="⚠️"
        />
      </DashboardPageHeader>

      {/* ======================================================== */}
      {/* FACILITY FILTER & SCOPE CONTROL HEADER */}
      {/* ======================================================== */}
      {isAdmin && warehouses.length > 0 && (
        <section
          aria-label="Facility Data Scope Controller"
          className="relative rounded-2xl border-2 border-[#7DA0FA]/40 bg-gradient-to-r from-[#4747A1]/8 via-[#7978E9]/5 to-[#7DA0FA]/10 dark:from-slate-900 dark:via-[#4747A1]/20 dark:to-slate-900 p-6 shadow-sm overflow-hidden"
        >
          {/* Top Edge Indicator Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4747A1] via-[#7978E9] to-[#7DA0FA]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Info Column */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#4747A1] px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-2xs">
                  <span>🏬</span>
                  <span>
                    {isAdmin ? 'Facility Filter / Scope' : 'Active Facility Workspace'}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#7DA0FA]/20 px-2 py-0.5 text-[11px] font-bold text-[#4747A1] dark:text-[#7DA0FA] border border-[#7DA0FA]/30">
                  <span>⚡</span>
                  <span>Live Filter Applied</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#4747A1] dark:text-white tracking-tight flex items-center gap-2">
                  <span>Active Scope:</span>
                  <span className="underline decoration-[#7DA0FA] underline-offset-4">
                    {isAdmin && !selectedWarehouseId
                      ? 'Global Enterprise (All Facilities)'
                      : activeWarehouse?.name || 'Local Warehouse'}
                  </span>
                  {activeWarehouse?.code && (
                    <span className="text-xs font-mono font-extrabold bg-[#4747A1]/10 dark:bg-[#7DA0FA]/20 text-[#4747A1] dark:text-[#7DA0FA] px-2 py-0.5 rounded">
                      {activeWarehouse.code}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-2xl mt-0.5">
                  All KPI counter cards, Recharts visualizations, and recent movement
                  activity streams below are dynamically scoped to this selected facility.
                </p>
              </div>
            </div>

            {/* Right Interactive Selection Controls */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-[#7DA0FA]/30 shadow-2xs backdrop-blur-xs">
              <div className="space-y-1">
                <label
                  htmlFor="facility-scope-select"
                  className="block text-[11px] font-black uppercase tracking-wider text-[#4747A1] dark:text-[#7DA0FA]"
                >
                  Change Facility Scope
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="facility-scope-select"
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="rounded-lg border-2 border-[#7DA0FA]/50 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs focus:border-[#4747A1] focus:ring-2 focus:ring-[#7DA0FA]/30 focus:outline-none transition-all cursor-pointer min-w-[220px]"
                  >
                    {isAdmin && (
                      <option value="">🌐 All Warehouses (Global Network)</option>
                    )}
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        🏬 {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>

                  {isAdmin && selectedWarehouseId && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedWarehouseId('')}
                      className="text-xs font-bold text-[#4747A1] border border-[#7DA0FA]/40 bg-[#7DA0FA]/15 hover:bg-[#7DA0FA]/25"
                      title="Reset to Global Enterprise Scope"
                    >
                      Reset View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 3 PIE CHARTS SECTION (Admin vs Staff) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#4747A1] dark:text-white tracking-tight flex items-center gap-2">
              <span>📊</span>
              <span>
                {isAdmin && !selectedWarehouseId
                  ? 'Enterprise Inventory Visualizations'
                  : `Warehouse Visualizations — ${activeWarehouse?.name || 'Local Facility'}`}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Powered by dedicated backend REST aggregations with live server-side
              caching.
            </p>
          </div>
        </div>

        {isAdmin && !selectedWarehouseId ? (
          /* ADMIN 3 PIE CHARTS (Overall Network) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin Chart 1: Product Stock by Category */}
            <RechartsPieChart
              title="Category Stock Allocation"
              subtitle="Aggregated stock units per product category"
              data={categoryStockData}
              totalLabel="Units in Stock"
              emptyMessage="No stock recorded across product categories"
              icon="🏷️"
            />

            {/* Admin Chart 2: Warehouse Stock Distribution */}
            <RechartsPieChart
              title="Warehouse Stock Distribution"
              subtitle="Total units distributed across facility network"
              data={warehouseStockData}
              totalLabel="Stored Units"
              emptyMessage="No warehouse inventory found"
              icon="🏬"
            />

            {/* Admin Chart 3: Monthly Inbound & Outbound Movements */}
            <RechartsPieChart
              title="Monthly Movement Volume"
              subtitle="Last 30 days inbound receipts vs outbound orders"
              data={monthlyMovementsData}
              totalLabel="Movements"
              emptyMessage="No movement records logged in the last 30 days"
              icon="🔄"
            />
          </div>
        ) : (
          /* STAFF 3 PIE CHARTS (or Admin Scoped to Single Facility) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Staff Chart 1: Category Stock in Staff's Warehouse */}
            <RechartsPieChart
              title="Facility Category Stock"
              subtitle={`Stock units by category in ${activeWarehouse?.name || 'assigned warehouse'}`}
              data={categoryStockData}
              totalLabel="Local Units"
              emptyMessage={`No items currently stocked in ${activeWarehouse?.name || 'this warehouse'}`}
              icon="📦"
            />

            {/* Staff Chart 2: Monthly Inbound & Outbound for Staff's Warehouse */}
            <RechartsPieChart
              title="Monthly Inbound & Outbound"
              subtitle={`Fulfillment shipments & receipts for ${activeWarehouse?.code || 'Facility'}`}
              data={monthlyMovementsData}
              totalLabel="Facility Logs"
              emptyMessage="No movements recorded for this facility this month"
              icon="🔄"
            />

            {/* Staff Chart 3: Stock Health & Status Breakdown (Sample) */}
            <RechartsPieChart
              title="Stock Health & Status"
              subtitle="Optimal vs Low Stock vs Out-of-Stock SKU breakdown"
              data={stockHealthData}
              totalLabel="Catalog SKUs"
              emptyMessage="No inventory SKUs registered"
              icon="🛡️"
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* QUICK WORKSPACE ACTIONS & SHORTCUT CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          href="/products"
          className="rounded-2xl border-2 border-[#7DA0FA]/30 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#4747A1] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">📦</span>
            <span className="text-xs font-bold text-[#4747A1] group-hover:translate-x-1 transition-transform">
              View Catalog →
            </span>
          </div>
          <h3 className="font-extrabold text-base text-[#4747A1] dark:text-white mt-3">
            Products Catalog
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse {totalProducts} registered SKUs across categories.
          </p>
        </Link>

        <Link
          href="/movements"
          className="rounded-2xl border-2 border-[#7DA0FA]/30 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#4747A1] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🔄</span>
            <span className="text-xs font-bold text-[#4747A1] group-hover:translate-x-1 transition-transform">
              Record Movement →
            </span>
          </div>
          <h3 className="font-extrabold text-base text-[#4747A1] dark:text-white mt-3">
            Stock Movements
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Record inbound receiving, customer outbound deductions, or adjustments.
          </p>
        </Link>

        <Link
          href="/transfers"
          className="rounded-2xl border-2 border-[#7DA0FA]/30 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#4747A1] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl">🔀</span>
            <span className="text-xs font-bold text-[#4747A1] group-hover:translate-x-1 transition-transform">
              New Transfer →
            </span>
          </div>
          <h3 className="font-extrabold text-base text-[#4747A1] dark:text-white mt-3">
            Stock Transfers
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Perform atomic double-entry transfers between storage facilities.
          </p>
        </Link>
      </div>

      {/* ======================================================== */}
      {/* RECENT INVENTORY MOVEMENTS TABLE */}
      {/* ======================================================== */}
      <div className="rounded-2xl border-2 border-[#7DA0FA]/30 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#7DA0FA]/20 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#4747A1] dark:text-white flex items-center gap-2">
              <span>📜</span>
              <span>Recent Activity Stream</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest inventory operations and receipts logged across the database.
            </p>
          </div>
          <Link href="/movements">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-bold border border-[#7DA0FA]/40 bg-[#7DA0FA]/10 text-[#4747A1]"
            >
              Full Audit Trail
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#7DA0FA]/20 bg-[#7DA0FA]/5 text-[#4747A1] dark:text-[#7DA0FA] font-black uppercase tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3">Reason / User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7DA0FA]/10">
              {recentMovements.slice(0, 5).map((m) => {
                const isOutbound = m.type === 'outbound';
                const badgeStyle = getMovementBadgeStyle(m.type);
                const quantityColor = getMovementQuantityColor(m.type);

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-[#7DA0FA]/5 transition-colors font-medium text-slate-800 dark:text-slate-200"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {new Date(m.createdAt).toLocaleDateString()}{' '}
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${badgeStyle}`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {m.product?.name || 'Product'}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {m.product?.sku}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {m.warehouse?.name || 'Assigned Warehouse'}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-black font-mono text-sm ${quantityColor}`}
                    >
                      {isOutbound ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {m.reason || 'Standard operation'}
                    </td>
                  </tr>
                );
              })}
              {recentMovements.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No recent inventory movement records logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
