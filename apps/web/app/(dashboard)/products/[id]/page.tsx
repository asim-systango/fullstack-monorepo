'use client';

import { use, useState, useEffect, type SyntheticEvent } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  Badge,
  Button,
  Field,
  TextInput,
  TextArea,
  Select,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Spinner,
  StatusMessage,
  EmptyState,
} from '@shared/ui';
import { toast } from '@/components/ui/toast';
import { ProductImage } from '@/components/products/product-image';
import { useProduct, useUpdateProduct } from '@/lib/hooks/use-products';
import { useCategories } from '@/lib/hooks/use-categories';
import { useWarehouses } from '@/lib/hooks/use-warehouses';
import { useAuth } from '@/components/auth';

type PageParams = {
  id: string;
};

export default function ProductDetailPage({
  params,
}: Readonly<{
  params: Promise<PageParams>;
}>) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canManage = isAdmin || user?.role === 'staff';

  const {
    data: product,
    isLoading: isProductLoading,
    isError,
    error,
  } = useProduct(productId);
  const { data: categories = [] } = useCategories();
  const { data: warehouses = [], isLoading: isWarehousesLoading } = useWarehouses();
  const updateMutation = useUpdateProduct();

  const [isEditing, setIsEditing] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  // Populate local form state when product data loads or when edit is cancelled
  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setCategoryId(product.categoryId || '');
      setDescription(product.description || '');
      setUnit(product.unit || 'pcs');
      setImageUrl(product.imageUrl || '');
      setLowStockThreshold(product.lowStockThreshold ?? 5);
    }
  }, [product]);

  useEffect(() => {
    if (user?.warehouseId) {
      setSelectedWarehouseId(user.warehouseId);
    } else if (warehouses.length > 0 && warehouses[0]?.id && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [user?.warehouseId, warehouses, selectedWarehouseId]);

  const isLoading = isProductLoading || isWarehousesLoading;

  const handleCancel = () => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setCategoryId(product.categoryId || '');
      setDescription(product.description || '');
      setUnit(product.unit || 'pcs');
      setImageUrl(product.imageUrl || '');
      setLowStockThreshold(product.lowStockThreshold ?? 5);
    }
    setFeedbackMessage(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!name.trim()) {
      setFeedbackMessage({ tone: 'error', text: 'Product name cannot be empty.' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: productId,
        data: {
          name: name.trim(),
          categoryId: categoryId || undefined,
          description: description.trim() || undefined,
          unit: unit.trim() || 'pcs',
          imageUrl: imageUrl.trim() || undefined,
          lowStockThreshold: Number(lowStockThreshold),
        },
      });

      setFeedbackMessage({
        tone: 'success',
        text: 'Product details saved successfully!',
      });
      toast.success('Product details saved successfully!');
      setIsEditing(false);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMsg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        'Failed to update product details.';
      setFeedbackMessage({
        tone: 'error',
        text: errorMsg,
      });
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 rounded-lg border border-border bg-card">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground font-medium">
          Loading product details form...
        </p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          ← Back to Products Catalog
        </Link>
        <StatusMessage tone="error">
          Failed to load product details. {error?.message || 'Product not found.'}
        </StatusMessage>
      </div>
    );
  }

  const totalQuantity = product.totalQuantity ?? product.totalStock ?? 0;
  const threshold = product.lowStockThreshold ?? 5;

  const staffWarehouse =
    warehouses.find((w) => w.id === (user?.warehouseId || selectedWarehouseId)) ||
    warehouses[0];
  const staffStockRecord = product.stockLevels?.find(
    (sl) => sl.warehouseId === staffWarehouse?.id,
  );
  const staffFacilityQty = staffStockRecord?.quantity ?? 0;

  let staffQtyColorClass = 'text-emerald-600 dark:text-emerald-400';
  if (staffFacilityQty === 0) {
    staffQtyColorClass = 'text-red-600 font-extrabold dark:text-red-400';
  } else if (staffFacilityQty <= threshold) {
    staffQtyColorClass = 'text-rose-600 dark:text-rose-400';
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Navigation & Edit Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Products Catalog
        </Link>

        <div className="flex items-center gap-3">
          <Badge tone={isAdmin ? 'accent' : 'neutral'} className="capitalize">
            {user?.role || 'Guest'} Role
          </Badge>

          {canManage && (
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    form="product-detail-form"
                    disabled={updateMutation.isPending}
                    loading={updateMutation.isPending}
                  >
                    Submit
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Details
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Message Banner */}
      {feedbackMessage && (
        <StatusMessage tone={feedbackMessage.tone}>{feedbackMessage.text}</StatusMessage>
      )}

      {/* Product Hero Header with Uniform Image Display */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl border-2 border-[#7DA0FA]/30 bg-card shadow-xs">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          size="detail"
          className="border-2 border-[#7DA0FA]/40 shadow-sm"
        />
        <div className="space-y-3 flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
              🏷️ {product.category?.name || 'Unassigned Category'}
            </span>
            <span className="font-mono text-xs font-bold text-[#4747A1] dark:text-[#7DA0FA] bg-[#4747A1]/10 px-2.5 py-1 rounded-lg">
              {product.sku}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {product.description}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-2">
            <div>
              <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                Total Stock Units
              </div>
              <div className="text-2xl font-mono font-black text-foreground">
                {totalQuantity.toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  {product.unit || 'pcs'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                Alert Threshold
              </div>
              <div className="text-2xl font-mono font-black text-foreground">
                ≤ {threshold}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  {product.unit || 'pcs'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Form Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                Product Information
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Update the fields below and click Submit to save changes.'
                  : 'Product specifications and inventory control parameters (Non-editable view).'}
              </CardDescription>
            </div>
            {!isEditing && <Badge tone="neutral">Read Only Mode</Badge>}
          </div>
        </CardHeader>

        <CardBody className="pt-2">
          <form id="product-detail-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: SKU Code (Always Non-Editable) */}
            <Field
              label="SKU Code"
              required
              hint="Unique inventory SKU identifier (System read-only)"
            >
              <TextInput value={sku} disabled className="bg-muted font-mono font-bold" />
            </Field>

            {/* Field 2: Product Name */}
            <Field label="Product Name" required hint="Full official name of the item">
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. Wireless Ergonomic Mouse"
                required
              />
            </Field>

            {/* Field 3: Image URL & Preview */}
            <Field label="Product Image URL" hint="Direct link to hosted product picture">
              <div className="flex items-center gap-3">
                <TextInput
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <ProductImage
                  src={imageUrl}
                  alt={name || 'Product Image Preview'}
                  size="table"
                />
              </div>
            </Field>

            {/* Field 4: Category */}
            <Field label="Category" required hint="Product category classification">
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!isEditing}
                required
              >
                <option value="" disabled>
                  -- Select Category --
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Field>

            {/* Field 5: Description */}
            <Field
              label="Description"
              hint="Technical specifications or item description"
            >
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isEditing}
                rows={3}
                placeholder="Product specifications..."
              />
            </Field>

            {/* Field 6: Unit of Measure */}
            <Field label="Unit of Measure" hint="Packaging unit e.g. pcs, kg, box">
              <TextInput
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={!isEditing}
                placeholder="pcs"
              />
            </Field>

            {/* Field 7: Low Stock Threshold */}
            <Field
              label="Low Stock Threshold"
              hint="Minimum inventory count before low-stock alert triggers"
            >
              <TextInput
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                disabled={!isEditing}
              />
            </Field>
          </form>
        </CardBody>
      </Card>

      {/* Role-Based Warehouse Inventory Stock Table */}
      {isAdmin ? (
        /* ADMIN VIEW: Per-warehouse stock breakdown */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Per-Warehouse Stock Breakdown
                </CardTitle>
                <CardDescription>
                  Current inventory across all regional fulfillment centers. Total:{' '}
                  {totalQuantity.toLocaleString()} {unit || 'pcs'}.
                </CardDescription>
              </div>
              <Badge tone="accent">Admin View</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0 overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="w-[120px]">Facility Code</TableHeaderCell>
                  <TableHeaderCell>Warehouse Name</TableHeaderCell>
                  <TableHeaderCell>Location Address</TableHeaderCell>
                  <TableHeaderCell className="text-right">Stock Quantity</TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Facility Status
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warehouses.map((wh) => {
                  const stockLevel = product.stockLevels?.find(
                    (sl) => sl.warehouseId === wh.id,
                  );
                  const qty = stockLevel?.quantity ?? 0;
                  const isWhLowStock = qty <= threshold;

                  let whStatusBadge = <Badge tone="success">In Stock</Badge>;
                  if (qty === 0) {
                    whStatusBadge = <Badge tone="danger">Out of Stock</Badge>;
                  } else if (isWhLowStock) {
                    whStatusBadge = <Badge tone="danger">Low Stock</Badge>;
                  }

                  let whQtyClass = 'text-emerald-600 dark:text-emerald-400';
                  if (qty === 0) {
                    whQtyClass = 'text-red-600 font-extrabold dark:text-red-400';
                  } else if (isWhLowStock) {
                    whQtyClass = 'text-rose-600 dark:text-rose-400';
                  }

                  return (
                    <TableRow key={wh.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono font-semibold text-foreground">
                          {wh.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground">{wh.name}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs">
                        {wh.location || 'Indore Facility'}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        <span className={whQtyClass}>
                          {qty.toLocaleString()} {unit || 'pcs'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{whStatusBadge}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        /* STAFF VIEW: Stock details for staff's warehouse only */
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  My Assigned Warehouse Inventory
                </CardTitle>
                <CardDescription>
                  Stock details strictly for your assigned warehouse facility.
                </CardDescription>
              </div>

              {staffWarehouse && (
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border">
                  <span className="text-muted-foreground font-medium">
                    Assigned Facility:
                  </span>
                  <span>{staffWarehouse.name}</span>
                  <span className="text-muted-foreground font-mono font-normal">
                    ({staffWarehouse.code})
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardBody>
            {staffWarehouse ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">
                      Facility Name
                    </span>
                    <span className="font-bold text-foreground">
                      {staffWarehouse.name}
                    </span>
                    <span className="text-muted-foreground font-mono block mt-0.5">
                      Code: {staffWarehouse.code}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block font-medium">
                      Location
                    </span>
                    <span className="font-medium text-foreground">
                      {staffWarehouse.location || 'Indore Facility'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Warehouse Facility</TableHeaderCell>
                        <TableHeaderCell className="text-right">
                          Available Stock
                        </TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-foreground">
                              {staffWarehouse.name}
                            </div>
                            <div className="text-xs font-mono text-muted-foreground">
                              {staffWarehouse.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono text-base">
                          <span className={staffQtyColorClass}>
                            {staffFacilityQty.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Warehouse Assigned"
                description="No warehouse facility found for your staff profile."
              />
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
