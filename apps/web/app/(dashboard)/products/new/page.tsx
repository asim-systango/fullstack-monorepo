'use client';

import { useState, useMemo, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Field, TextInput, Select, Button, StatusMessage, Badge } from '@shared/ui';
import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';
import { useAuth } from '@/components/auth';
import { useCategories } from '@/lib/hooks/use-categories';
import { useWarehouses } from '@/lib/hooks/use-warehouses';
import { useCreateProduct, type InitialStockInput } from '@/lib/hooks/use-products';
import { toast } from '@/components/ui/toast';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Master data
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: warehouses = [], isLoading: isWarehousesLoading } = useWarehouses();
  const createProductMutation = useCreateProduct();

  // Basic Product Info State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [description, setDescription] = useState('');

  // Initial Stock State
  // For Admin: map of warehouseId -> quantity string
  const [warehouseStockMap, setWarehouseStockMap] = useState<Record<string, string>>({});
  // For Staff: single quantity for their assigned warehouse
  const [staffStock, setStaffStock] = useState('0');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Staff's assigned warehouse
  const staffWarehouse = useMemo(() => {
    if (user?.warehouseId) {
      return warehouses.find((w) => w.id === user.warehouseId) || null;
    }
    return warehouses[0] || null;
  }, [warehouses, user?.warehouseId]);

  // Total allocated units computed in real-time
  const totalInitialUnits = useMemo(() => {
    if (isAdmin) {
      return Object.values(warehouseStockMap).reduce((sum, val) => {
        const qty = parseInt(val, 10);
        return sum + (isNaN(qty) || qty < 0 ? 0 : qty);
      }, 0);
    }
    const staffQty = parseInt(staffStock, 10);
    return isNaN(staffQty) || staffQty < 0 ? 0 : staffQty;
  }, [isAdmin, warehouseStockMap, staffStock]);

  const handleAdminStockChange = (warehouseId: string, value: string) => {
    setWarehouseStockMap((prev) => ({
      ...prev,
      [warehouseId]: value,
    }));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedSku = sku.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedSku) {
      const msg = 'SKU Code is required.';
      setErrorMessage(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    if (!trimmedName) {
      const msg = 'Product Name is required.';
      setErrorMessage(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    const selectedCatId = categoryId || categories[0]?.id;
    if (!selectedCatId) {
      const msg = 'Please select a valid product category.';
      setErrorMessage(msg);
      toast.error(msg, 'Validation Error');
      return;
    }

    // Build initial stock array
    const initialStock: InitialStockInput[] = [];

    if (isAdmin) {
      warehouses.forEach((wh) => {
        const qtyStr = warehouseStockMap[wh.id];
        const qty = parseInt(qtyStr || '0', 10);
        if (!isNaN(qty) && qty > 0) {
          initialStock.push({
            warehouseId: wh.id,
            quantity: qty,
          });
        }
      });
    } else if (staffWarehouse) {
      const qty = parseInt(staffStock, 10);
      if (!isNaN(qty) && qty > 0) {
        initialStock.push({
          warehouseId: staffWarehouse.id,
          quantity: qty,
        });
      }
    }

    try {
      await createProductMutation.mutateAsync({
        sku: trimmedSku,
        name: trimmedName,
        categoryId: selectedCatId,
        unit: unit.trim() || 'pcs',
        description: description.trim() || undefined,
        initialStock: initialStock.length > 0 ? initialStock : undefined,
      });

      toast.success(`Product "${trimmedName}" (${trimmedSku}) registered successfully!`);
      router.push('/products');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to create product. Please try again.';
      setErrorMessage(msg);
      toast.error(msg, 'Registration Failed');
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Banner */}
      <DashboardPageHeader
        badge={isAdmin ? 'Admin Catalog Management' : 'Staff Facility Intake'}
        subtag="New Inventory Master Record"
        title="Create New Product"
        description={
          isAdmin
            ? 'Define product specifications, SKU identifier, category assignment, and allocate initial stock across multiple warehouses.'
            : `Add a new product to the catalog and record initial intake stock for ${staffWarehouse?.name || 'your assigned facility'}.`
        }
      >
        <HeaderStatCard
          label="Total Warehouses"
          value={isWarehousesLoading ? '...' : warehouses.length}
          subtext="facilities available"
          tone="primary"
          icon="🏬"
        />
        <HeaderStatCard
          label="Initial Allocation"
          value={totalInitialUnits.toLocaleString()}
          subtext={`${unit || 'pcs'} total`}
          tone="success"
          icon="📦"
        />
      </DashboardPageHeader>

      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4747A1] dark:text-[#7DA0FA] hover:underline"
        >
          <span>←</span>
          <span>Back to Products Catalog</span>
        </Link>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <StatusMessage tone="error" className="shadow-xs">
          {errorMessage}
        </StatusMessage>
      )}

      {/* Main Creation Form Container */}
      <Form
        onSubmit={handleSubmit}
        className="rounded-2xl border-2 border-[#7DA0FA]/30 bg-card p-6 sm:p-8 shadow-sm space-y-8"
      >
        {/* ======================================================== */}
        {/* SECTION 1: BASIC PRODUCT INFORMATION */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4747A1] text-white font-bold text-xs shadow-2xs">
              1
            </span>
            <h3 className="text-base font-extrabold text-[#4747A1] dark:text-white uppercase tracking-wider">
              General Product Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Product Name */}
            <Field label="Product Name" htmlFor="productName" required>
              <TextInput
                id="productName"
                placeholder="e.g. Ergonomic Office Chair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="font-semibold text-sm"
              />
            </Field>

            {/* SKU Code */}
            <Field
              label="SKU Code"
              htmlFor="productSku"
              required
              hint="Unique identifier across all facilities"
            >
              <TextInput
                id="productSku"
                placeholder="e.g. FURN-CHAIR-001"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                required
                className="font-mono font-bold text-sm uppercase"
              />
            </Field>

            {/* Category Selection */}
            <Field label="Category" htmlFor="productCategory" required>
              <Select
                id="productCategory"
                value={categoryId || (categories[0]?.id ?? '')}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isCategoriesLoading}
                className="font-semibold text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏷️ {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            {/* Unit of Measurement */}
            <Field label="Unit of Measurement" htmlFor="productUnit" required>
              <Select
                id="productUnit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="font-semibold text-sm"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="boxes">Boxes (boxes)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters (liters)</option>
                <option value="pairs">Pairs (pairs)</option>
                <option value="sets">Sets (sets)</option>
                <option value="cartons">Cartons (cartons)</option>
              </Select>
            </Field>

            {/* Description (Span 2 cols on lg) */}
            <div className="sm:col-span-2">
              <Field label="Description / Specification" htmlFor="productDescription">
                <TextInput
                  id="productDescription"
                  placeholder="Optional specifications, dimensions, material, or internal notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: INITIAL WAREHOUSE STOCK ALLOCATION */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4747A1] text-white font-bold text-xs shadow-2xs">
              2
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-base font-extrabold text-[#4747A1] dark:text-white uppercase tracking-wider">
                Initial Stock Allocation
              </h3>
              <Badge
                tone={isAdmin ? 'success' : 'accent'}
                className="text-[11px] font-bold"
              >
                {isAdmin
                  ? '🌐 Multi-Warehouse Enterprise Scope'
                  : '🏬 Single Facility Scope'}
              </Badge>
            </div>
          </div>

          {/* ADMIN: Multi-Warehouse Matrix */}
          {isAdmin ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground font-medium">
                As an Administrator, you can enter initial inventory counts for each
                facility simultaneously. Facilities left at 0 will have zero stock
                initialized.
              </p>

              {warehouses.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  No warehouses registered yet. You can create warehouses in the
                  Warehouses tab.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {warehouses.map((wh) => {
                    const currentQty = warehouseStockMap[wh.id] || '';
                    return (
                      <div
                        key={wh.id}
                        className="rounded-xl border-2 border-[#7DA0FA]/30 bg-muted/20 p-4 space-y-3 hover:border-[#4747A1]/50 transition-all shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-extrabold text-sm text-foreground">
                              {wh.name}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-[#4747A1] dark:text-[#7DA0FA]">
                              {wh.code}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            📍 {wh.location || 'Hub'}
                          </span>
                        </div>

                        <Field label="Initial Stock Units" htmlFor={`stock-wh-${wh.id}`}>
                          <div className="relative">
                            <TextInput
                              id={`stock-wh-${wh.id}`}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={currentQty}
                              onChange={(e) =>
                                handleAdminStockChange(wh.id, e.target.value)
                              }
                              className="font-bold text-base pr-12 text-slate-900 bg-white"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                              {unit || 'pcs'}
                            </span>
                          </div>
                        </Field>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* STAFF: Single Facility Allocation */
            <div className="rounded-xl border-2 border-[#7DA0FA]/30 bg-muted/20 p-6 space-y-4 max-w-xl shadow-2xs">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4747A1] dark:text-[#7DA0FA]">
                  Target Facility
                </div>
                <div className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <span>🏬</span>
                  <span>{staffWarehouse?.name || 'Assigned Warehouse'}</span>
                  {staffWarehouse?.code && (
                    <span className="text-xs font-mono font-bold bg-[#4747A1]/10 dark:bg-[#7DA0FA]/20 text-[#4747A1] dark:text-[#7DA0FA] px-2 py-0.5 rounded">
                      {staffWarehouse.code}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  As a warehouse staff member, this product will be registered with
                  initial inventory for your facility.
                </p>
              </div>

              <Field
                label="Initial Quantity Inflow"
                htmlFor="staffStockQty"
                required
                hint="Initial unit count to receive into this warehouse"
              >
                <div className="relative max-w-xs">
                  <TextInput
                    id="staffStockQty"
                    type="number"
                    min="0"
                    value={staffStock}
                    onChange={(e) => setStaffStock(e.target.value)}
                    required
                    className="font-bold text-lg pr-12 text-slate-900 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                    {unit || 'pcs'}
                  </span>
                </div>
              </Field>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: ACTIONS & SUBMIT */}
        {/* ======================================================== */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-border/80">
          <Link href="/products">
            <Button
              variant="secondary"
              type="button"
              className="px-6 py-2.5 font-bold text-xs"
            >
              Cancel
            </Button>
          </Link>

          <Button
            variant="primary"
            type="submit"
            loading={createProductMutation.isPending}
            loadingText="Creating Product..."
            className="px-8 py-2.5 font-black text-xs sm:text-sm bg-[#4747A1] hover:bg-[#3b3b88] text-white shadow-md rounded-xl cursor-pointer"
          >
            💾 Save Product & Allocate Stock
          </Button>
        </div>
      </Form>
    </div>
  );
}
