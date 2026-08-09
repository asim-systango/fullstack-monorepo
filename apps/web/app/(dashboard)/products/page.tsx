'use client';

import { useState, useCallback, useEffect } from 'react';
import { useCategories } from '@/lib/hooks/use-categories';
import { useProducts } from '@/lib/hooks/use-products';
import { useWarehouses } from '@/lib/hooks/use-warehouses';
import { useAuth } from '@/components/auth';
import { ProductToolbar } from '@/components/products/product-toolbar';
import { AdminProductTable } from '@/components/products/admin-product-table';
import { StaffProductTable } from '@/components/products/staff-product-table';
import { StatusMessage, Badge } from '@shared/ui';

export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Fetch categories & warehouses
  const { data: categories = [] } = useCategories();
  const { data: warehouses = [] } = useWarehouses();

  // Set default warehouse ID for staff view
  useEffect(() => {
    if (warehouses.length > 0 && warehouses[0]?.id && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  // Fetch product list
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useProducts({
    search: searchQuery,
    categoryIds: selectedCategoryIds,
    lowStockOnly,
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
    setLowStockOnly(false);
  }, []);

  const activeWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);

  return (
    <div className="space-y-6">
      {/* Header based in uses role */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Products Catalog
            </h1>
            <Badge tone={isAdmin ? 'accent' : 'neutral'} className="capitalize">
              {user?.role || 'Guest'} Role
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? 'Admin Catalog View: Showing overall product details, SKU codes, categories, and total aggregated stock.'
              : `Staff Warehouse View: Showing stock details for ${activeWarehouse?.name || 'your assigned warehouse'}.`}
          </p>
        </div>
        <div className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-md self-start sm:self-auto">
          {isLoading ? 'Loading...' : `${products.length} products listed`}
        </div>
      </div>

      {/* Error Banner */}
      {isError && (
        <StatusMessage tone="error">
          Failed to load product listing.{' '}
          {error?.message || 'Please check your connection.'}
        </StatusMessage>
      )}

      {/* Filter bar */}
      <ProductToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryToggle={handleCategoryToggle}
        onSelectAllCategories={handleSelectAllCategories}
        onClearCategories={handleClearCategories}
        lowStockOnly={lowStockOnly}
        onResetFilters={handleResetFilters}
      />

      {/* Table based on teh role */}
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
