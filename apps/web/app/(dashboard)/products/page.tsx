'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCategories } from '@/lib/hooks/use-categories';
import { useProducts } from '@/lib/hooks/use-products';
import { useWarehouses } from '@/lib/hooks/use-warehouses';
import { useAuth } from '@/components/auth';
import { ProductToolbar } from '@/components/products/product-toolbar';
import { AdminProductTable } from '@/components/products/admin-product-table';
import { StaffProductTable } from '@/components/products/staff-product-table';
import { StatusMessage } from '@shared/ui';
import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';

export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Fetch categories & warehouses
  const { data: categories = [] } = useCategories();
  const { data: warehouses = [] } = useWarehouses();

  // Set default warehouse ID for staff view based on user profile or first available warehouse
  useEffect(() => {
    if (user?.warehouseId) {
      setSelectedWarehouseId(user.warehouseId);
    } else if (warehouses.length > 0 && warehouses[0]?.id && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [user?.warehouseId, warehouses, selectedWarehouseId]);

  // Fetch product listing matching query and multiple categories
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useProducts({
    search: searchQuery,
    categoryIds: selectedCategoryIds,
  });

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }, []);

  const handleSelectAllCategories = useCallback(() => {
    setSelectedCategoryIds(categories.map((c) => c.id));
  }, [categories]);

  const handleClearCategories = useCallback(() => {
    setSelectedCategoryIds([]);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategoryIds([]);
  }, []);

  const activeWarehouse =
    warehouses.find((w) => w.id === (user?.warehouseId || selectedWarehouseId)) ||
    warehouses[0];

  return (
    <div className="space-y-6">
      {/* Header Section strictly driven by user role */}
      <DashboardPageHeader
        badge={`${user?.role || 'Guest'} Role`}
        subtag="Central Inventory Index"
        title="Products Catalog"
        description={
          isAdmin
            ? 'Admin Catalog View: Showing overall product details, SKU codes, categories, and total aggregated stock.'
            : `Staff Warehouse View: Showing stock details for ${activeWarehouse?.name || 'your assigned warehouse'}.`
        }
      >
        <HeaderStatCard
          label="Total Products"
          value={isLoading ? '...' : products.length}
          subtext="items"
          tone="primary"
          icon="📦"
        />
        <HeaderStatCard
          label="Categories"
          value={isLoading ? '...' : categories.length}
          subtext="groups"
          tone="neutral"
          icon="🏷️"
        />
      </DashboardPageHeader>

      {/* Error Banner */}
      {isError && (
        <StatusMessage tone="error">
          Failed to load product listing.{' '}
          {error?.message || 'Please check your connection.'}
        </StatusMessage>
      )}

      {/* Top Filter Bar with Search and Multi-Category Checkmarks */}
      <ProductToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryToggle={handleCategoryToggle}
        onSelectAllCategories={handleSelectAllCategories}
        onClearCategories={handleClearCategories}
        onResetFilters={handleResetFilters}
      />

      {/* Table rendered strictly based on User Role */}
      {isAdmin ? (
        <AdminProductTable products={products} isLoading={isLoading} />
      ) : (
        <StaffProductTable
          products={products}
          isLoading={isLoading}
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId}
          onWarehouseChange={setSelectedWarehouseId}
        />
      )}
    </div>
  );
}
