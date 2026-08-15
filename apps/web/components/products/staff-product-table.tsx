'use client';

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
import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/layout/page-skeleton';
import { ProductImage } from './product-image';
import { useAuth } from '@/components/auth';
import type { Product } from '@/lib/hooks/use-products';
import type { Warehouse } from '@/lib/hooks/use-warehouses';

type StaffProductTableProps = {
  products: Product[];
  isLoading: boolean;
  warehouses: Warehouse[];
  selectedWarehouseId?: string;
  onWarehouseChange?: (warehouseId: string) => void;
};

const PAGE_SIZE = 10;

export function StaffProductTable({
  products,
  isLoading,
  warehouses,
  selectedWarehouseId,
}: Readonly<StaffProductTableProps>) {
  const { user } = useAuth();
  const staffWarehouseId = user?.warehouseId || selectedWarehouseId;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  const activeWarehouse =
    warehouses.find((w) => w.id === staffWarehouseId) || warehouses[0];

  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      {/* Staff Warehouse Context Banner */}
      <div className="bg-muted/30 px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge tone="accent">Staff Facility View</Badge>
          <span className="text-xs text-muted-foreground font-medium">
            Viewing inventory strictly for assigned facility
          </span>
        </div>
        {activeWarehouse && (
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-background px-3 py-1 rounded-md border border-border shadow-2xs">
            <span className="text-muted-foreground font-medium">Facility:</span>
            <span>{activeWarehouse.name}</span>
            <span className="text-muted-foreground font-mono font-normal">
              ({activeWarehouse.code})
            </span>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="p-6">
          <EmptyState
            title="No Products Found"
            description="No products match your current search and category parameters."
          />
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[120px]">SKU Code</TableHeaderCell>
                <TableHeaderCell>Product Name</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Assigned Warehouse</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Facility Quantity
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => {
                const facilityStock = product.stockLevels?.find(
                  (sl) => sl.warehouseId === activeWarehouse?.id,
                );
                const facilityQty = facilityStock?.quantity ?? 0;
                const threshold = product.lowStockThreshold ?? 5;

                let qtyColorClass = 'text-emerald-600 dark:text-emerald-400';
                if (facilityQty === 0) {
                  qtyColorClass = 'text-red-600 font-extrabold dark:text-red-400';
                } else if (facilityQty <= threshold) {
                  qtyColorClass = 'text-rose-600 dark:text-rose-400';
                }

                return (
                  <TableRow
                    key={product.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
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
                    <TableCell>
                      {activeWarehouse ? (
                        <div className="text-xs">
                          <span className="font-medium text-foreground">
                            {activeWarehouse.name}
                          </span>
                          <span className="text-muted-foreground ml-1 font-mono">
                            ({activeWarehouse.code})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold font-mono">
                      <span className={qtyColorClass}>
                        {facilityQty.toLocaleString()}
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
            alwaysVisible={true}
          />
        </>
      )}
    </div>
  );
}
