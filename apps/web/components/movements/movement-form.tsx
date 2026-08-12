'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Form,
  Field,
  Select,
  TextInput,
  Button,
  Badge,
  StatusMessage,
  type BadgeTone,
} from '@shared/ui/components';
import { useWarehouses } from '@/lib/hooks/use-warehouses';
import { useProducts, type Product } from '@/lib/hooks/use-products';
import { useRecordMovement, type MovementType } from '@/lib/hooks/use-movements';

function getMovementActionLabel(movementType: MovementType): string {
  if (movementType === 'outbound') return 'fulfilled order';
  if (movementType === 'inbound') return 'received stock';
  return 'adjusted stock';
}

function getStockStatusLabel(stock: number, lowThreshold: number): string {
  if (stock === 0) return 'Out of Stock';
  if (stock <= lowThreshold) return 'Low Stock';
  return 'In Stock';
}

export function MovementForm() {
  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const recordMovementMutation = useRecordMovement();

  // Staff member's assigned warehouse (resolved via token / session context)
  const staffWarehouse = warehouses[0];

  const [productId, setProductId] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [skuInput, setSkuInput] = useState<string>('');
  const [type, setType] = useState<MovementType>('outbound');
  const [quantity, setQuantity] = useState<string>('1');
  const [reason, setReason] = useState<string>('Order Fulfillment');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper: Get stock quantity strictly for the staff's logged-in warehouse
  const getStaffWarehouseStockForProduct = useCallback(
    (product: Product): number => {
      if (!staffWarehouse || !product.stockLevels) return 0;
      const level = product.stockLevels.find(
        (sl) => sl.warehouseId === staffWarehouse.id,
      );
      return level ? level.quantity : 0;
    },
    [staffWarehouse],
  );

  // Filter products by typed name query
  const filteredProductsByName = useMemo(() => {
    if (!nameInput.trim()) return products;
    const query = nameInput.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(query));
  }, [products, nameInput]);

  // Handle typing product name
  const handleNameTyped = (typedName: string) => {
    setNameInput(typedName);
    const query = typedName.trim().toLowerCase();
    if (!query) {
      setProductId('');
      setSkuInput('');
      return;
    }
    const matches = products.filter((p) => p.name.toLowerCase().includes(query));
    const firstMatch = matches[0];
    if (matches.length === 1 && firstMatch) {
      setProductId(firstMatch.id);
      setSkuInput(firstMatch.sku);
    } else {
      const exactMatch = products.find((p) => p.name.toLowerCase() === query);
      if (exactMatch) {
        setProductId(exactMatch.id);
        setSkuInput(exactMatch.sku);
      }
    }
  };

  // Sync Name and SKU inputs when product is selected from dropdown
  const handleProductSelect = (selectedId: string) => {
    setProductId(selectedId);
    const found = products.find((p) => p.id === selectedId);
    if (found) {
      setNameInput(found.name);
      setSkuInput(found.sku);
    } else {
      setNameInput('');
      setSkuInput('');
    }
  };

  // Sync Product dropdown and Name input when user manually types SKU
  const handleSkuTyped = (typedSku: string) => {
    setSkuInput(typedSku);
    const query = typedSku.trim().toLowerCase();
    if (!query) {
      setProductId('');
      return;
    }
    const found = products.find((p) => p.sku.toLowerCase() === query);
    if (found) {
      setProductId(found.id);
      setNameInput(found.name);
    }
  };

  // Resolve currently active product
  const activeProduct = useMemo<Product | undefined>(() => {
    if (productId) {
      return products.find((p) => p.id === productId);
    }
    if (skuInput.trim()) {
      return products.find((p) => p.sku.toLowerCase() === skuInput.trim().toLowerCase());
    }
    if (nameInput.trim()) {
      return products.find(
        (p) => p.name.toLowerCase() === nameInput.trim().toLowerCase(),
      );
    }
    return undefined;
  }, [products, productId, skuInput, nameInput]);

  // Resolve stock quantity STRICTLY for the staff member's logged-in warehouse
  const staffWarehouseStock = useMemo<number | null>(() => {
    if (!activeProduct) return null;
    return getStaffWarehouseStockForProduct(activeProduct);
  }, [activeProduct, getStaffWarehouseStockForProduct]);

  const parsedQty = parseInt(quantity, 10) || 0;
  const isOutbound = type === 'outbound';
  const isInsufficientStock =
    isOutbound && staffWarehouseStock !== null && parsedQty > staffWarehouseStock;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!activeProduct) {
      setErrorMessage(
        'Please select a valid product, type a product name, or enter a matching SKU.',
      );
      return;
    }

    if (parsedQty <= 0) {
      setErrorMessage('Movement quantity must be greater than zero.');
      return;
    }

    if (isInsufficientStock) {
      setErrorMessage(
        `Insufficient stock! Available: ${staffWarehouseStock} pcs, Requested: ${parsedQty} pcs.`,
      );
      return;
    }

    try {
      await recordMovementMutation.mutateAsync({
        warehouseId: staffWarehouse?.id,
        productId: activeProduct.id,
        type,
        quantity: parsedQty,
        reason: reason.trim() || undefined,
      });

      const actionText = getMovementActionLabel(type);

      setSuccessMessage(
        `Successfully ${actionText} of ${parsedQty} ${activeProduct.unit || 'pcs'} for ${activeProduct.name} [${activeProduct.sku}].`,
      );

      // Reset quantity
      setQuantity('1');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        'Failed to record stock movement.';
      setErrorMessage(msg);
    }
  };

  const getStockBadgeTone = (qty: number, threshold: number): BadgeTone => {
    if (qty === 0) return 'danger';
    if (qty <= threshold) return 'neutral';
    return 'success';
  };

  return (
    <div className="w-full rounded-2xl border-2 border-[#7DA0FA]/40 bg-white text-slate-900 shadow-sm overflow-hidden">
      {/* Top Accent Gradient Header */}
      <div className="h-2 w-full bg-gradient-to-r from-[#4747A1] via-[#7978E9] to-[#7DA0FA]" />

      {/* Admin Header Banner (#4747A1 Deep Indigo) */}
      <div className="bg-[#4747A1] text-white px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-white font-black text-2xl shadow-xs">
            📦
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-wide text-white uppercase">
              STOCK MOVEMENT & ORDER FULFILLMENT FORM
            </h2>
            <p className="text-xs text-[#7DA0FA] font-bold mt-0.5">
              Warehouse Inventory Entry & Fulfillment
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6 bg-white">
        <Form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && <StatusMessage tone="error">{errorMessage}</StatusMessage>}
          {successMessage && (
            <StatusMessage tone="success">{successMessage}</StatusMessage>
          )}

          {/* Action Type Preset Buttons */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-[#4747A1] uppercase tracking-widest block border-b-2 border-[#7DA0FA]/30 pb-1.5">
              MOVEMENT ACTION TYPE *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                className={`flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-black transition-all border-2 ${
                  type === 'outbound'
                    ? 'bg-[#7978E9] text-white border-[#4747A1] shadow-md ring-2 ring-[#7978E9]/30'
                    : 'bg-[#7DA0FA]/10 text-[#4747A1] hover:bg-[#7DA0FA]/20 border-[#7DA0FA]/30'
                }`}
                onClick={() => {
                  setType('outbound');
                  setReason('Order Fulfillment');
                }}
              >
                <span>📦</span>
                <span>Fulfill Order (Outbound)</span>
              </button>

              <button
                type="button"
                className={`flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-black transition-all border-2 ${
                  type === 'inbound'
                    ? 'bg-[#7978E9] text-white border-[#4747A1] shadow-md ring-2 ring-[#7978E9]/30'
                    : 'bg-[#7DA0FA]/10 text-[#4747A1] hover:bg-[#7DA0FA]/20 border-[#7DA0FA]/30'
                }`}
                onClick={() => {
                  setType('inbound');
                  setReason('Inbound Stock Receipt');
                }}
              >
                <span>📥</span>
                <span>Receive Stock (Inbound)</span>
              </button>

              <button
                type="button"
                className={`flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-black transition-all border-2 ${
                  type === 'adjustment'
                    ? 'bg-[#7978E9] text-white border-[#4747A1] shadow-md ring-2 ring-[#7978E9]/30'
                    : 'bg-[#7DA0FA]/10 text-[#4747A1] hover:bg-[#7DA0FA]/20 border-[#7DA0FA]/30'
                }`}
                onClick={() => {
                  setType('adjustment');
                  setReason('Cycle Count Adjustment');
                }}
              >
                <span>⚖️</span>
                <span>Recount Adjustment</span>
              </button>
            </div>
          </div>

          {/* Product Specification Section Container */}
          <div className="space-y-4 rounded-xl bg-[#7DA0FA]/5 border-2 border-[#7DA0FA]/30 p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b-2 border-[#7DA0FA]/30 pb-2.5">
              <label className="text-xs font-black text-[#4747A1] uppercase tracking-widest flex items-center gap-2">
                <span>🔍</span>
                <span>PRODUCT SPECIFICATION</span>
              </label>
              <span className="text-xs font-bold text-slate-500">
                Type name, pick from list, or enter SKU
              </span>
            </div>

            {/* Product Name Input */}
            <Field
              label="Product Name Search"
              htmlFor="nameInput"
              hint="Type product name to search or auto-select (e.g., Ergonomic Chair)"
            >
              <TextInput
                id="nameInput"
                value={nameInput}
                onChange={(e) => handleNameTyped(e.target.value)}
                placeholder="Type product name..."
                className="font-bold text-slate-900 bg-white border-[#7DA0FA]/60 focus:border-[#4747A1]"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Catalog Dropdown */}
              <Field label="Product Catalog" htmlFor="productId">
                <Select
                  id="productId"
                  value={productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  disabled={isLoadingProducts}
                  className="font-bold text-slate-900 bg-white border-[#7DA0FA]/60 focus:border-[#4747A1]"
                >
                  <option value="">
                    -- Choose Product ({filteredProductsByName.length} available) --
                  </option>
                  {filteredProductsByName.map((p) => {
                    const localStock = getStaffWarehouseStockForProduct(p);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.sku}] — {localStock} {p.unit || 'pcs'} in stock
                      </option>
                    );
                  })}
                </Select>
              </Field>

              {/* Product SKU Input */}
              <Field
                label="Product SKU Code"
                htmlFor="skuInput"
                hint="Or enter exact SKU code (e.g., SKU-101)"
              >
                <TextInput
                  id="skuInput"
                  value={skuInput}
                  onChange={(e) => handleSkuTyped(e.target.value)}
                  placeholder="e.g., SKU-101"
                  className="font-mono text-sm font-bold text-slate-900 bg-white border-[#7DA0FA]/60 focus:border-[#4747A1]"
                />
              </Field>
            </div>
          </div>

          {/* Live Warehouse Stock Availability Banner */}
          {activeProduct && staffWarehouseStock !== null && (
            <div className="rounded-xl border-2 border-[#7978E9]/40 bg-[#7DA0FA]/10 p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2 font-black text-[#4747A1] text-base">
                <span>✨</span>
                <span>{activeProduct.name}</span>
                <span className="font-mono text-xs font-extrabold text-[#4747A1] bg-white px-2.5 py-0.5 rounded border border-[#7DA0FA]">
                  {activeProduct.sku}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-black text-[#4747A1] uppercase">
                    Available Stock
                  </div>
                  <div className="text-2xl font-black text-[#4747A1]">
                    {staffWarehouseStock}{' '}
                    <span className="text-xs font-bold text-slate-600">
                      {activeProduct.unit || 'pcs'}
                    </span>
                  </div>
                </div>
                <Badge
                  tone={getStockBadgeTone(
                    staffWarehouseStock,
                    activeProduct.lowStockThreshold ?? 5,
                  )}
                  className="px-3.5 py-1.5 font-black text-xs uppercase tracking-wider shadow-2xs"
                >
                  {getStockStatusLabel(
                    staffWarehouseStock,
                    activeProduct.lowStockThreshold ?? 5,
                  )}
                </Badge>
              </div>
            </div>
          )}

          {/* Movement Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Movement Quantity"
              htmlFor="quantity"
              required
              hint={
                isInsufficientStock
                  ? `⚠️ Insufficient stock! Requesting ${parsedQty} units but only ${staffWarehouseStock} units available.`
                  : undefined
              }
            >
              <TextInput
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5"
                required
                className="font-black text-lg text-slate-900 bg-white border-[#7DA0FA]/60"
              />
            </Field>

            <Field
              label="Order Reference / Reason"
              htmlFor="reason"
              hint="e.g., Fulfill Order #SO-1001, Vendor Receipt, Cycle Count"
            >
              <TextInput
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Order Fulfillment #SO-1001"
                className="font-bold text-slate-900 bg-white border-[#7DA0FA]/60"
              />
            </Field>
          </div>

          {/* Form Submit Action Bar */}
          <div className="flex justify-end pt-4 border-t-2 border-[#7DA0FA]/30">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto font-black px-10 py-3.5 text-sm bg-[#4747A1] hover:bg-[#3b3b88] text-white shadow-md tracking-wider uppercase border border-[#7978E9]"
              loading={recordMovementMutation.isPending}
              loadingText="Processing Movement..."
              disabled={isInsufficientStock}
            >
              {type === 'outbound'
                ? '📦 PROCESS ORDER FULFILLMENT'
                : 'SAVE STOCK MOVEMENT'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
