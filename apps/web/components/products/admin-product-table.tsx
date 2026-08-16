'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
  EmptyState,
  Pagination,
} from '@shared/ui';
import { TableSkeleton } from '@/components/layout/page-skeleton';
import { ProductImage } from './product-image';
import type { Product } from '@/lib/hooks/use-products';

type AdminProductTableProps = {
  products: Product[];
  isLoading: boolean;
};

const PAGE_SIZE = 10;

export function AdminProductTable({
  products,
  isLoading,
}: Readonly<AdminProductTableProps>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when total product count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  if (isLoading) {
    return <TableSkeleton rows={5} />;
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

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
            <TableHeaderCell className="text-right">Total Quantity</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProducts.map((product) => {
            const totalQuantity = product.totalQuantity ?? product.totalStock ?? 0;
            const threshold = product.lowStockThreshold ?? 5;
            const isLowStock = totalQuantity <= threshold;

            return (
              <TableRow key={product.id} className="hover:bg-muted/40 transition-colors">
                <TableCell>
                  <span className="font-mono text-xs font-bold text-[#4747A1] dark:text-[#7DA0FA]">
                    {product.sku}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      size="table"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-bold text-sm text-foreground hover:text-[#4747A1] dark:hover:text-[#7DA0FA] hover:underline transition-colors block truncate"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {product.category?.name ? (
                    <span className="text-xs font-semibold text-foreground">
                      🏷️ {product.category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={products.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
