'use client';

import { useState, useMemo } from 'react';
import {
  Page,
  Form,
  Field,
  Select,
  TextInput,
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  StatusMessage,
  LoadingState,
  EmptyState,
  type BadgeTone,
} from '@shared/ui/components';
import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';
import { useWarehouses } from '@/lib/hooks/use-warehouses';
import { useProducts, type Product } from '@/lib/hooks/use-products';
import { useTransfers, useCreateTransfer } from '@/lib/hooks/use-transfers';
import { type StockMovement } from '@/lib/hooks/use-movements';

function getSourceFacilityName(t: StockMovement): string {
  if (t.sourceWarehouse?.name) {
    return t.sourceWarehouse.name;
  }
  if (t.sourceWarehouseId) {
    return 'Source Facility';
  }
  return '—';
}

function getDestFacilityName(t: StockMovement): string {
  return t.warehouse?.name || 'Destination Facility';
}

function getTransferStockStatusText(stock: number, lowThreshold: number): string {
  if (stock === 0) return 'Out of Stock';
  if (stock <= lowThreshold) return 'Low Stock';
  return 'In Stock';
}

export default function TransfersPage() {
  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useWarehouses();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const {
    data: transfers = [],
    isLoading: isLoadingTransfers,
    error: transfersError,
  } = useTransfers();

  const createTransferMutation = useCreateTransfer();

  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>('');
  const [destWarehouseId, setDestWarehouseId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [reason, setReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute available stock at source warehouse for selected product
  const selectedProduct = useMemo<Product | undefined>(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  const sourceAvailableStock = useMemo<number | null>(() => {
    if (!selectedProduct || !sourceWarehouseId) return null;
    const stockLevel = selectedProduct.stockLevels?.find(
      (sl) => sl.warehouseId === sourceWarehouseId,
    );
    return stockLevel ? stockLevel.quantity : 0;
  }, [selectedProduct, sourceWarehouseId]);

  const parsedQty = parseInt(quantity, 10) || 0;
  const isInsufficientStock =
    sourceAvailableStock !== null && parsedQty > sourceAvailableStock;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!sourceWarehouseId) {
      setErrorMessage('Please select a source warehouse.');
      return;
    }

    if (!destWarehouseId) {
      setErrorMessage('Please select a destination warehouse.');
      return;
    }

    if (sourceWarehouseId === destWarehouseId) {
      setErrorMessage('Source and destination warehouses cannot be the same site.');
      return;
    }

    if (!productId) {
      setErrorMessage('Please select a product to transfer.');
      return;
    }

    if (parsedQty <= 0) {
      setErrorMessage('Transfer quantity must be greater than zero.');
      return;
    }

    if (isInsufficientStock) {
      setErrorMessage(
        `Insufficient stock at source warehouse. Available: ${sourceAvailableStock} pcs, Requested: ${parsedQty} pcs.`,
      );
      return;
    }

    try {
      await createTransferMutation.mutateAsync({
        sourceWarehouseId,
        destWarehouseId,
        productId,
        quantity: parsedQty,
        reason: reason.trim() || undefined,
      });

      setSuccessMessage(
        `Successfully transferred ${parsedQty} ${selectedProduct?.unit || 'pcs'} of ${selectedProduct?.name || 'product'}.`,
      );
      setQuantity('1');
      setReason('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error)?.message ||
        'Failed to process inter-warehouse transfer.';
      setErrorMessage(msg);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStockBadgeTone = (qty: number, threshold: number): BadgeTone => {
    if (qty === 0) return 'danger';
    if (qty <= threshold) return 'neutral';
    return 'success';
  };

  return (
    <Page className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header Section */}
      <DashboardPageHeader
        badge="Multi-Facility Network"
        subtag="Double-Entry Inventory System"
        title="Inter-Warehouse Stock Transfers"
        description="Transfer inventory between storage facilities in a single atomic transaction without driving source stock negative."
      >
        <HeaderStatCard
          label="Total Facilities"
          value={warehouses.length}
          subtext="active sites"
          tone="primary"
          icon="🏬"
        />
      </DashboardPageHeader>

      {/* Transfer Form Builder (Same brand palette as /movements) */}
      <div className="w-full rounded-2xl border-2 border-[#7DA0FA]/40 bg-white text-slate-900 shadow-sm overflow-hidden">
        {/* Top Accent Gradient Header */}
        <div className="h-2 w-full bg-gradient-to-r from-[#4747A1] via-[#7978E9] to-[#7DA0FA]" />

        {/* Admin Header Banner */}
        <div className="bg-[#4747A1] text-white px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 border border-white/20 text-white font-black text-2xl shadow-xs">
              🔄
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white uppercase">
                NEW INTER-WAREHOUSE STOCK TRANSFER
              </h2>
              <p className="text-xs text-[#7DA0FA] font-bold mt-0.5">
                Atomic Inventory Movement Between Storage Facilities
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

            {/* Warehouse Facility Selection Grid */}
            <div className="space-y-4 rounded-xl bg-[#7DA0FA]/5 border-2 border-[#7DA0FA]/30 p-5 shadow-2xs">
              <label className="text-xs font-black text-[#4747A1] uppercase tracking-widest block border-b-2 border-[#7DA0FA]/30 pb-2">
                FACILITY SELECTION *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Source Warehouse */}
                <Field
                  label="From (Source Warehouse)"
                  htmlFor="sourceWarehouseId"
                  required
                >
                  <Select
                    id="sourceWarehouseId"
                    value={sourceWarehouseId}
                    onChange={(e) => setSourceWarehouseId(e.target.value)}
                    disabled={isLoadingWarehouses}
                    className="font-bold text-slate-900 bg-white border-[#7DA0FA]/60 focus:border-[#4747A1]"
                  >
                    <option value="">-- Select Source Site --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </Select>
                </Field>

                {/* Destination Warehouse */}
                <Field
                  label="To (Destination Warehouse)"
                  htmlFor="destWarehouseId"
                  required
                >
                  <Select
                    id="destWarehouseId"
                    value={destWarehouseId}
                    onChange={(e) => setDestWarehouseId(e.target.value)}
                    disabled={isLoadingWarehouses}
                    className="font-bold text-slate-900 bg-white border-[#7DA0FA]/60 focus:border-[#4747A1]"
                  >
                    <option value="">-- Select Destination Site --</option>
                    {warehouses
                      .filter((w) => w.id !== sourceWarehouseId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.code})
                        </option>
                      ))}
                  </Select>
                </Field>
              </div>
            </div>

            {/* Product & Quantity Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Selector */}
              <Field label="Product to Transfer" htmlFor="productId" required>
                <Select
                  id="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  disabled={isLoadingProducts}
                  className="font-bold text-slate-900 bg-white border-[#7DA0FA]/60 focus:border-[#4747A1]"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.sku}]
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Transfer Quantity */}
              <Field
                label="Transfer Quantity"
                htmlFor="transferQuantity"
                required
                hint={
                  isInsufficientStock
                    ? `⚠️ Cannot transfer ${parsedQty} units; only ${sourceAvailableStock} units available at source.`
                    : undefined
                }
              >
                <TextInput
                  id="transferQuantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="font-black text-lg text-slate-900 bg-white border-[#7DA0FA]/60"
                />
              </Field>
            </div>

            {/* Live Available Stock Banner */}
            {sourceWarehouseId && productId && sourceAvailableStock !== null && (
              <div className="rounded-xl border-2 border-[#7978E9]/40 bg-[#7DA0FA]/10 p-4 flex items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <div className="font-black text-[#4747A1] text-sm">
                    Source Stock Level
                  </div>
                  <div className="text-xs text-slate-600 font-semibold">
                    Product: {selectedProduct?.name} [{selectedProduct?.sku}]
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-[#4747A1]">
                    {sourceAvailableStock}{' '}
                    <span className="text-xs font-bold text-slate-600">
                      {selectedProduct?.unit || 'pcs'}
                    </span>
                  </span>
                  <Badge
                    tone={getStockBadgeTone(
                      sourceAvailableStock,
                      selectedProduct?.lowStockThreshold ?? 5,
                    )}
                  >
                    {getTransferStockStatusText(
                      sourceAvailableStock,
                      selectedProduct?.lowStockThreshold ?? 5,
                    )}
                  </Badge>
                </div>
              </div>
            )}

            {/* Notes / Reference */}
            <Field label="Transfer Notes / Reference" htmlFor="transferReason">
              <TextInput
                id="transferReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Stock rebalance for Q3 fulfillment"
                className="font-bold text-slate-900 bg-white border-[#7DA0FA]/60"
              />
            </Field>

            {/* Form Submit Action Bar */}
            <div className="flex justify-end pt-4 border-t-2 border-[#7DA0FA]/30">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto font-black px-10 py-3.5 text-sm bg-[#4747A1] hover:bg-[#3b3b88] text-white shadow-md tracking-wider uppercase border border-[#7978E9]"
                loading={createTransferMutation.isPending}
                loadingText="Transferring Stock..."
                disabled={isInsufficientStock}
              >
                🔄 EXECUTE INTER-WAREHOUSE TRANSFER
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Full-width Transfer History Log Section */}
      <div className="w-full space-y-4 pt-2">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <span>📜</span>
          <span>Inter-Warehouse Transfer Audit History</span>
        </h2>

        {isLoadingTransfers && <LoadingState label="Loading transfer logs..." />}
        {transfersError && (
          <EmptyState
            title="Failed to load transfers"
            description={(transfersError as Error)?.message || 'API error'}
          />
        )}
        {!isLoadingTransfers && !transfersError && transfers.length === 0 && (
          <EmptyState
            title="No transfers executed yet"
            description="Use the transfer entry form above to move inventory between warehouses."
          />
        )}
        {!isLoadingTransfers && !transfersError && transfers.length > 0 && (
          <div className="w-full overflow-x-auto border-y border-border/80 bg-background">
            <Table>
              <TableHead>
                <TableRow className="border-b border-border/80 bg-muted/30">
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Date & Time
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Product & SKU
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    From (Source)
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    To (Destination)
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Qty Transferred
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Transfer Notes
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium py-3">
                      {formatDate(t.createdAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-bold text-foreground text-sm">
                        {t.product?.name || 'Product'}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit mt-0.5">
                        {t.product?.sku}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground py-3">
                      {getSourceFacilityName(t)}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-foreground py-3">
                      {getDestFacilityName(t)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-3">
                      <span className="inline-flex items-center font-extrabold text-sm text-[#4747A1] bg-[#7DA0FA]/15 border border-[#7DA0FA]/40 px-2.5 py-0.5 rounded">
                        {t.quantity} {t.product?.unit || 'pcs'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground max-w-xs truncate py-3">
                      {t.reason || 'Inter-warehouse transfer'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Page>
  );
}
