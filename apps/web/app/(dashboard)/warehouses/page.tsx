'use client';

import { useState, useMemo, type SyntheticEvent } from 'react';
import Link from 'next/link';
import {
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  type Warehouse,
} from '@/lib/hooks/use-warehouses';
import { useProducts } from '@/lib/hooks/use-products';
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
  EmptyState,
  StatusMessage,
} from '@shared/ui';
import { DashboardPageHeader, HeaderStatCard } from '@/components/layout/page-header';

export default function WarehousesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    data: warehouses = [],
    isLoading: isWarehousesLoading,
    isError,
    error,
  } = useWarehouses();
  const { data: products = [], isLoading: isProductsLoading } = useProducts();

  const createWarehouseMutation = useCreateWarehouse();
  const updateWarehouseMutation = useUpdateWarehouse();

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [createError, setCreateError] = useState('');

  // Edit Modal State
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editError, setEditError] = useState('');

  const isLoading = isWarehousesLoading || isProductsLoading;

  // Calculate Aggregated Metrics
  const metrics = useMemo(() => {
    const totalWarehouses = warehouses.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;

    warehouses.forEach((wh) => {
      totalStockUnits += wh.totalStockUnits ?? 0;
    });

    products.forEach((p) => {
      const threshold = p.lowStockThreshold ?? 5;
      const totalQty = p.totalQuantity ?? p.totalStock ?? 0;
      if (totalQty <= threshold) {
        lowStockCount += 1;
      }
    });

    return {
      totalWarehouses,
      totalStockUnits,
      totalSkus: products.length,
      lowStockCount,
    };
  }, [warehouses, products]);

  // Filtered Warehouses
  const filteredWarehouses = useMemo(() => {
    if (!searchQuery.trim()) return warehouses;
    const query = searchQuery.toLowerCase().trim();
    return warehouses.filter(
      (wh) =>
        wh.name.toLowerCase().includes(query) ||
        wh.code.toLowerCase().includes(query) ||
        (wh.location && wh.location.toLowerCase().includes(query)),
    );
  }, [warehouses, searchQuery]);

  // Handlers for Create Modal
  const handleOpenCreate = () => {
    setNewCode('');
    setNewName('');
    setNewLocation('');
    setCreateError('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newCode.trim()) {
      setCreateError('Warehouse code is required.');
      return;
    }
    if (!newName.trim()) {
      setCreateError('Warehouse name is required.');
      return;
    }

    try {
      await createWarehouseMutation.mutateAsync({
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        location: newLocation.trim() || undefined,
      });
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create warehouse.';
      setCreateError(msg);
    }
  };

  // Handlers for Edit Modal
  const handleOpenEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setEditName(wh.name);
    setEditLocation(wh.location || '');
    setEditError('');
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          badge="Admin Only"
          title="Warehouse Locations & Facilities"
          description="Warehouse location details and facility management are restricted strictly to Administrator users."
        />
        <StatusMessage tone="error">
          Access Denied. You do not have permission to view or manage warehouse
          facilities.
        </StatusMessage>
      </div>
    );
  }

  const handleEditSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editingWarehouse) return;
    if (!editName.trim()) {
      setEditError('Warehouse name is required.');
      return;
    }

    try {
      await updateWarehouseMutation.mutateAsync({
        id: editingWarehouse.id,
        data: {
          name: editName.trim(),
          location: editLocation.trim() || undefined,
        },
      });
      setEditingWarehouse(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update warehouse.';
      setEditError(msg);
    }
  };

  let warehouseGridContent;
  if (isLoading) {
    warehouseGridContent = (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-64 rounded-2xl border border-border bg-card/60 p-6 space-y-4 animate-pulse shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-5 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-16 bg-muted/50 rounded-xl" />
            <div className="h-8 w-28 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  } else if (filteredWarehouses.length === 0) {
    const emptyDescription = searchQuery
      ? `No facilities matched "${searchQuery}". Try a different keyword.`
      : 'No warehouse locations recorded yet.';
    warehouseGridContent = (
      <div className="p-8 bg-card rounded-lg border border-border">
        <EmptyState
          title="No Warehouse Facilities Found"
          description={emptyDescription}
        />
      </div>
    );
  } else {
    warehouseGridContent = (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWarehouses.map((wh) => (
          <Card
            key={wh.id}
            className="flex flex-col justify-between hover:border-primary/50 transition-all duration-200 shadow-xs hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-accent/10 text-accent border border-accent/20">
                    {wh.code}
                  </span>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {wh.name}
                  </CardTitle>
                </div>
                <Badge tone="success">Operational</Badge>
              </div>
              <CardDescription className="text-xs line-clamp-1 mt-1">
                📍 {wh.location || 'Location unassigned'}
              </CardDescription>
            </CardHeader>

            <CardBody className="py-2 border-t border-b border-border/60 bg-muted/20 my-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Stock Units Allocated:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {(wh.totalStockUnits ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Unique SKUs Handled:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {wh.totalSkusCount ?? 0} SKUs
                </span>
              </div>
            </CardBody>

            <div className="p-4 pt-2 flex items-center justify-between gap-2">
              <Link href={`/warehouses/${wh.id}`} className="flex-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs justify-center gap-1.5"
                >
                  <span>👁️</span>
                  <span>View Details</span>
                </Button>
              </Link>

              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEdit(wh)}
                  className="text-xs px-3"
                  title="Edit Facility"
                >
                  ✏️ Edit
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <DashboardPageHeader
        badge="Admin Management"
        subtag="Storage & Regional Hubs"
        title="Warehouse Locations & Facilities"
        description="Overview of storage facilities, location management, stock allocation, and regional hubs."
      >
        <HeaderStatCard
          label="Total Facilities"
          value={isLoading ? '...' : metrics.totalWarehouses}
          subtext="active sites"
          tone="primary"
          icon="🏬"
        />
        <HeaderStatCard
          label="Total Stock"
          value={isLoading ? '...' : metrics.totalStockUnits.toLocaleString()}
          subtext="units"
          tone="neutral"
          icon="📦"
        />
        {isAdmin && (
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 self-start sm:self-auto font-bold bg-[#4747A1] hover:bg-[#3b3b88] text-white border border-[#7978E9] shadow-sm px-4 py-2"
          >
            <span>➕</span>
            <span>Add Warehouse</span>
          </Button>
        )}
      </DashboardPageHeader>

      {/* Error Alert */}
      {isError && (
        <StatusMessage tone="error">
          Failed to load warehouses.{' '}
          {error?.message || 'Please check your connection and try again.'}
        </StatusMessage>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-card via-card to-muted/20">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Facilities
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {isLoading ? '...' : metrics.totalWarehouses}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
              🏬
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card to-muted/20">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Managed SKUs
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {isLoading ? '...' : metrics.totalSkus.toLocaleString()}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success text-xl">
              📊
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-card via-card to-muted/20">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Low Stock Alerts
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {isLoading ? '...' : metrics.lowStockCount}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning text-xl">
              ⚠️
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <TextInput
            placeholder="Search facility name, code, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground font-medium">
            {filteredWarehouses.length}{' '}
            {filteredWarehouses.length === 1 ? 'facility' : 'facilities'}
          </span>
        </div>
      </div>

      {/* Loading & Grid View */}
      {warehouseGridContent}

      {/* Create Warehouse Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <form onSubmit={handleCreateSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Warehouse Facility</DialogTitle>
            <DialogDescription>
              Create a new storage location or distribution hub for stock tracking.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 py-4">
            {createError && <StatusMessage tone="error">{createError}</StatusMessage>}

            <Field
              label="Warehouse Code"
              required
              hint="Unique short identifier (e.g. VJA-01, HYD-02)"
            >
              <TextInput
                placeholder="VJA-01"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="uppercase font-mono"
                required
              />
            </Field>

            <Field
              label="Warehouse Name"
              required
              hint="Full facility name (e.g. Vijayawada Central Hub)"
            >
              <TextInput
                placeholder="Vijayawada Central Hub"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </Field>

            <Field
              label="Location / City"
              hint="Physical address or region (e.g. Vijayawada, AP)"
            >
              <TextInput
                placeholder="Vijayawada, Andhra Pradesh"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={createWarehouseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createWarehouseMutation.isPending}
            >
              Create Warehouse
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Edit Warehouse Dialog */}
      <Dialog
        open={Boolean(editingWarehouse)}
        onOpenChange={(open) => !open && setEditingWarehouse(null)}
      >
        <form onSubmit={handleEditSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Warehouse Details</DialogTitle>
            <DialogDescription>
              Update facility name or location details for {editingWarehouse?.code}.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 py-4">
            {editError && <StatusMessage tone="error">{editError}</StatusMessage>}

            <Field label="Warehouse Code">
              <TextInput
                value={editingWarehouse?.code || ''}
                disabled
                className="bg-muted font-mono"
              />
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
              onClick={() => setEditingWarehouse(null)}
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
