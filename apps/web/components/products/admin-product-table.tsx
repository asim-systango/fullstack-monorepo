'use client';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
  EmptyState,
  Spinner,
} from '@shared/ui';
import type { Product } from '@/lib/hooks/use-products';

type AdminProductTableProps = {
  products: Product[];
  isLoading: boolean;
};

export function AdminProductTable({
  products,
  isLoading,
}: Readonly<AdminProductTableProps>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-lg border border-border bg-card">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">
          Loading admin global products catalog...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <EmptyState
          title="No Products Found"
          description="No products match your current search criteria and selected category filters."
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Admin View</Badge>
          <span className="text-xs text-muted-foreground font-medium">
            Showing total aggregated inventory across all warehouses
          </span>
        </div>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-[120px]">SKU Code</TableHeaderCell>
            <TableHeaderCell>Product Name</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell className="text-center">Unit</TableHeaderCell>
            <TableHeaderCell className="text-right">Low Threshold</TableHeaderCell>
            <TableHeaderCell className="text-right">Total Quantity</TableHeaderCell>
            <TableHeaderCell className="text-center">Global Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => {
            const totalQuantity = product.totalQuantity ?? product.totalStock ?? 0;
            const threshold = product.lowStockThreshold ?? 5;
            const isLowStock = totalQuantity <= threshold;

            return (
              <TableRow key={product.id} className="hover:bg-muted/40 transition-colors">
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 text-xs font-mono font-semibold text-foreground">
                    {product.sku}
                  </code>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold text-foreground">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                        {product.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {product.category?.name ? (
                    <Badge tone="neutral">{product.category.name}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center font-medium text-xs uppercase tracking-wider text-muted-foreground">
                  {product.unit || 'pcs'}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {threshold}
                </TableCell>
                <TableCell className="text-right font-bold font-mono">
                  <span
                    className={
                      isLowStock
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }
                  >
                    {totalQuantity.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {isLowStock ? (
                    <Badge tone="danger">Low Stock</Badge>
                  ) : (
                    <Badge tone="success">In Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
