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
  Spinner,
} from '@shared/ui';
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

export function StaffProductTable({
  products,
  isLoading,
  warehouses,
  selectedWarehouseId,
}: Readonly<StaffProductTableProps>) {
  const { user } = useAuth();
  const staffWarehouseId = user?.warehouseId || selectedWarehouseId;
  const activeWarehouse =
    warehouses.find((w) => w.id === staffWarehouseId) || warehouses[0];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 rounded-lg border border-border bg-card">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">
          Loading staff facility stock records...
        </p>
      </div>
    );
  }

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

        {/* Assigned Facility Info */}
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
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-[120px]">SKU Code</TableHeaderCell>
              <TableHeaderCell>Product Name</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Assigned Warehouse</TableHeaderCell>
              <TableHeaderCell className="text-right">Facility Quantity</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              // Find stock level specifically for the staff's selected warehouse
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
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {product.sku}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
                      >
                        {product.name}
                      </Link>
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
                    <span className={qtyColorClass}>{facilityQty.toLocaleString()}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
