'use client';

import { use, useState, useMemo, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { useWarehouse, useUpdateWarehouse } from '@/lib/hooks/use-warehouses';
import { useProducts } from '@/lib/hooks/use-products';
import { useMovements } from '@/lib/hooks/use-movements';
import { useAuth } from '@/components/auth';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Field,
  TextInput,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  EmptyState,
  Spinner,
  StatusMessage,
} from '@shared/ui';

function getMovementTone(type: string): 'success' | 'danger' | 'neutral' {
  if (type === 'inbound') return 'success';
  if (type === 'outbound') return 'danger';
  return 'neutral';
}

export default function WarehouseDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    data: warehouse,
    isLoading: isWarehouseLoading,
    isError,
    error,
  } = useWarehouse(id);
  const { data: products = [], isLoading: isProductsLoading } = useProducts();
  const { data: movements = [], isLoading: isMovementsLoading } = useMovements({
    warehouseId: id,
  });

  const updateWarehouseMutation = useUpdateWarehouse();

  // Search filter for facility products
  const [productSearch, setProductSearch] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editError, setEditError] = useState('');

  const isLoading = isWarehouseLoading || isProductsLoading;

  // Filter products stocked in this facility
  const facilityProducts = useMemo(() => {
    return products.map((p) => {
      const stockRecord = p.stockLevels?.find((sl) => sl.warehouseId === id);
      const facilityQty = stockRecord?.quantity ?? 0;
      return {
        ...p,
        facilityQty,
      };
    });
  }, [products, id]);

  // Search filtered products
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return facilityProducts;
    const query = productSearch.toLowerCase().trim();
    return facilityProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.category?.name && p.category.name.toLowerCase().includes(query)),
    );
  }, [facilityProducts, productSearch]);

  // Metric calculation for this facility
  const facilityMetrics = useMemo(() => {
    let totalStockUnits = 0;
    let stockedSkusCount = 0;
    let lowStockCount = 0;

    facilityProducts.forEach((p) => {
      if (p.facilityQty > 0) {
        stockedSkusCount += 1;
      }
      totalStockUnits += p.facilityQty;
      const threshold = p.lowStockThreshold ?? 5;
      if (p.facilityQty <= threshold) {
        lowStockCount += 1;
      }
    });

    return {
      totalStockUnits,
      stockedSkusCount,
      lowStockCount,
    };
  }, [facilityProducts]);

  const handleOpenEdit = () => {
    if (!warehouse) return;
    setEditName(warehouse.name);
    setEditLocation(warehouse.location || '');
    setEditError('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) {
      setEditError('Warehouse name is required.');
      return;
    }

    try {
      await updateWarehouseMutation.mutateAsync({
        id,
        data: {
          name: editName.trim(),
          location: editLocation.trim() || undefined,
        },
      });
      setIsEditOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update warehouse details.';
      setEditError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3 rounded-lg border border-border bg-card">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading facility details...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1 transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <StatusMessage tone="error">
          Access Denied. Detailed facility management is restricted strictly to
          Administrator users.
        </StatusMessage>
      </div>
    );
  }

  if (isError || !warehouse) {
    return (
      <div className="space-y-4">
        <Link
          href="/warehouses"
          className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
        >
          ← Back to Warehouses
        </Link>
        <StatusMessage tone="error">
          Warehouse Not Found.{' '}
          {error?.message || 'The specified warehouse facility could not be loaded.'}
        </StatusMessage>
      </div>
    );
  }

  const renderMovementsContent = () => {
    if (isMovementsLoading) {
      return (
        <div className="p-8 text-center">
          <Spinner size="md" />
        </div>
      );
    }

    if (movements.length === 0) {
      return (
        <div className="p-6">
          <EmptyState
            title="No Movements Recorded"
            description="No recent stock movements have been logged for this facility."
          />
        </div>
      );
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-[140px]">Date / Time</TableHeaderCell>
            <TableHeaderCell className="w-[110px]">Type</TableHeaderCell>
            <TableHeaderCell>Product</TableHeaderCell>
            <TableHeaderCell className="text-right">Quantity</TableHeaderCell>
            <TableHeaderCell>Reason / Remarks</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.slice(0, 10).map((mv) => (
            <TableRow key={mv.id} className="hover:bg-muted/40 transition-colors">
              <TableCell className="text-xs text-muted-foreground font-mono">
                {new Date(mv.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge tone={getMovementTone(mv.type)} className="capitalize">
                  {mv.type}
                </Badge>
              </TableCell>
              <TableCell className="text-xs font-medium text-foreground">
                {mv.product?.name || mv.productId}
              </TableCell>
              <TableCell className="text-right font-mono font-bold text-xs">
                {mv.type === 'inbound' ? `+${mv.quantity}` : `-${mv.quantity}`}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground line-clamp-1">
                {mv.reason || 'Standard transaction'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href="/warehouses"
          className="text-xs text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1 transition-colors"
        >
          ← Back to Warehouses
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-lg border border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20">
              {warehouse.code}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {warehouse.name}
            </h1>
            <Badge tone="success">Operational Facility</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            📍 Location: {warehouse.location || 'Location unassigned'} • Created:{' '}
            {new Date(warehouse.createdAt).toLocaleDateString()}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenEdit}
            className="self-start sm:self-auto text-xs px-3"
          >
            ✏️ Edit Facility
          </Button>
        )}
      </div>

      {/* Facility Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardBody className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Allocated Stock Units
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1 font-mono">
                {facilityMetrics.totalStockUnits.toLocaleString()}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              📦
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardBody className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                SKUs Stocked
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1 font-mono">
                {facilityMetrics.stockedSkusCount} / {facilityProducts.length}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              📊
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/20">
          <CardBody className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Low Stock Threshold Alerts
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1 font-mono">
                {facilityMetrics.lowStockCount}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              ⚠️
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Facility Inventory Table Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Facility Inventory & Stock Levels
              </CardTitle>
              <CardDescription>
                Detailed stock breakdown for SKUs stored at {warehouse.name}.
              </CardDescription>
            </div>

            <div className="w-full sm:w-72">
              <TextInput
                placeholder="Search SKU or Product..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No Facility Products Found"
                description={
                  productSearch
                    ? `No products match search "${productSearch}".`
                    : 'No stock records associated with this facility.'
                }
              />
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-[120px]">SKU</TableHeaderCell>
                  <TableHeaderCell>Product Name</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell className="text-right">Facility Stock</TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Reorder Threshold
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center w-[120px]">
                    Stock Status
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => {
                  const threshold = product.lowStockThreshold ?? 5;
                  const qty = product.facilityQty;

                  let statusBadge = <Badge tone="success">In Stock</Badge>;
                  let qtyColorClass = 'text-emerald-600 dark:text-emerald-400';

                  if (qty === 0) {
                    statusBadge = <Badge tone="danger">Out of Stock</Badge>;
                    qtyColorClass = 'text-red-600 font-extrabold dark:text-red-400';
                  } else if (qty <= threshold) {
                    statusBadge = <Badge tone="accent">Low Stock</Badge>;
                    qtyColorClass = 'text-amber-600 font-bold dark:text-amber-400';
                  }

                  return (
                    <TableRow
                      key={product.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {product.sku}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {product.category?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        <span className={qtyColorClass}>{qty.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {threshold}
                      </TableCell>
                      <TableCell className="text-center">{statusBadge}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Facility Stock Movement Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Recent Stock Movement Activity
          </CardTitle>
          <CardDescription>
            Audit log of inbound, outbound, and adjustment movements recorded at this
            facility.
          </CardDescription>
        </CardHeader>
        <CardBody className="p-0">{renderMovementsContent()}</CardBody>
      </Card>

      {/* Edit Warehouse Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <form onSubmit={handleEditSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Warehouse Details</DialogTitle>
            <DialogDescription>
              Update name or location details for facility {warehouse.code}.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 py-4">
            {editError && <StatusMessage tone="error">{editError}</StatusMessage>}

            <Field label="Warehouse Code">
              <TextInput value={warehouse.code} disabled className="bg-muted font-mono" />
            </Field>

            <Field label="Warehouse Name" required>
              <TextInput
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </Field>

            <Field label="Location / Address">
              <TextInput
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditOpen(false)}
              disabled={updateWarehouseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updateWarehouseMutation.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
