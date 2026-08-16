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

type ProductTableProps = {
  products: Product[];
  isLoading: boolean;
};

export function ProductTable({ products, isLoading }: Readonly<ProductTableProps>) {
  console.log('products', products);
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-lg border border-border bg-card">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading products catalog...</p>
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
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-[120px]">SKU Code</TableHeaderCell>
            <TableHeaderCell>Product Name</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell className="text-right">Low Threshold</TableHeaderCell>
            <TableHeaderCell className="text-right">Total Stock</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => {
            const totalStock = product.totalStock ?? 0;
            const threshold = product.lowStockThreshold ?? 5;
            const isLowStock = totalStock <= threshold;

            return (
              <TableRow key={product.id} className="hover:bg-muted/40 transition-colors">
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {product.sku}
                  </span>
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
                    {totalStock.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
