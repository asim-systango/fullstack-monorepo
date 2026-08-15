'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
  TextInput,
  Select,
  Pagination,
  LoadingState,
  EmptyState,
  type BadgeTone,
} from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { useMovements, type MovementType } from '@/lib/hooks/use-movements';
import { useWarehouses } from '@/lib/hooks/use-warehouses';

export function MovementTable() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: warehouses = [] } = useWarehouses();
  const defaultWarehouseId =
    user?.warehouseId || (isAdmin ? '' : warehouses[0]?.id || '');

  const [selectedWarehouseId, setSelectedWarehouseId] =
    useState<string>(defaultWarehouseId);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  useEffect(() => {
    if (user?.warehouseId) {
      setSelectedWarehouseId(user.warehouseId);
    }
  }, [user?.warehouseId]);

  // Fetch movements (scoped to warehouseId if selected/staff, or all if admin with no warehouse selected)
  const {
    data: movements = [],
    isLoading,
    error,
  } = useMovements({
    warehouseId: selectedWarehouseId || undefined,
    type: (selectedType as MovementType) || undefined,
  });

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedWarehouseId, pageSize]);

  // Client-side search filtering by SKU, product name, or order reason
  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) return movements;
    const query = searchQuery.toLowerCase().trim();
    return movements.filter((m) => {
      const pName = m.product?.name?.toLowerCase() || '';
      const sku = m.product?.sku?.toLowerCase() || '';
      const reason = m.reason?.toLowerCase() || '';
      const whName = m.warehouse?.name?.toLowerCase() || '';
      return (
        pName.includes(query) ||
        sku.includes(query) ||
        reason.includes(query) ||
        whName.includes(query)
      );
    });
  }, [movements, searchQuery]);

  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);

  const paginatedMovements = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    return filteredMovements.slice(startIndex, startIndex + pageSize);
  }, [filteredMovements, validPage, pageSize]);

  const getMovementBadge = (type: MovementType, reason?: string) => {
    let tone: BadgeTone = 'neutral';
    let label = 'Adjustment';
    let icon = '⇄';

    if (type === 'outbound') {
      if (reason?.toLowerCase().includes('transfer to')) {
        tone = 'accent';
        label = 'Transfer Outbound';
        icon = '🔄';
      } else {
        tone = 'danger';
        label = 'Outbound (Order Fulfillment)';
        icon = '↘';
      }
    } else if (type === 'inbound') {
      tone = 'success';
      label = 'Inbound (Receipt)';
      icon = '↗';
    } else if (type === 'transfer') {
      tone = 'accent';
      label = 'Inter-Warehouse Transfer';
      icon = '🔄';
    }

    return (
      <Badge
        tone={tone}
        className="font-semibold text-xs py-0.5 px-2.5 flex items-center gap-1 w-fit"
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Badge>
    );
  };

  const formatQuantity = (type: MovementType, qty: number, reason?: string) => {
    if (type === 'outbound') {
      const isOutboundTransfer = reason?.toLowerCase().includes('transfer to');
      if (isOutboundTransfer) {
        return (
          <span className="inline-flex items-center font-extrabold text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
            -{qty}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center font-extrabold text-sm text-red-600 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
          -{qty}
        </span>
      );
    }
    if (type === 'inbound') {
      return (
        <span className="inline-flex items-center font-extrabold text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          +{qty}
        </span>
      );
    }
    if (type === 'transfer') {
      return (
        <span className="inline-flex items-center font-extrabold text-sm text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
          +{qty}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center font-extrabold text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
        ={qty}
      </span>
    );
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

  if (isLoading) {
    return <LoadingState label="Fetching movement audit trail..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load movements"
        description={(error as Error)?.message || 'Failed to connect to API'}
      />
    );
  }

  return (
    <section className="w-full space-y-4 pt-2">
      {/* Filter Toolbar Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Audit Records ({filteredMovements.length} total logged)
        </span>
        {(searchQuery || selectedType || (isAdmin && selectedWarehouseId)) && (
          <button
            type="button"
            className="text-xs font-semibold text-accent hover:underline cursor-pointer"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('');
              if (isAdmin) setSelectedWarehouseId('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div
        className={`grid grid-cols-1 gap-3 ${
          isAdmin && warehouses.length > 1 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
        }`}
      >
        {/* Search Input */}
        <div>
          <TextInput
            placeholder="🔍 Search SKU, product, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Movement Type Filter */}
        <div>
          <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">All Action Types</option>
            <option value="outbound">Outbound (Order Fulfillment)</option>
            <option value="inbound">Inbound (Stock Receipt)</option>
            <option value="adjustment">Stock Adjustment</option>
            <option value="transfer">Transfer</option>
          </Select>
        </div>

        {/* Admin Facility Filter */}
        {isAdmin && warehouses.length > 1 && (
          <div>
            <Select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
            >
              <option value="">🌐 All Facilities (Global)</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  🏬 {wh.name} ({wh.code})
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Full-width Data Table with Always-Visible Pagination Controls */}
      {filteredMovements.length === 0 ? (
        <EmptyState
          title="No stock movements recorded"
          description="Process an outbound order fulfillment or inbound shipment using the form above."
        />
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border/80 bg-background shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow className="border-b border-border/80 bg-muted/30">
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Date & Time
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Action Type
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Product & SKU
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Facility
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Qty Change
                  </TableHeaderCell>
                  <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                    Reason / Order Ref
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMovements.map((m) => (
                  <TableRow
                    key={m.id}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium py-3">
                      {formatDate(m.createdAt)}
                    </TableCell>
                    <TableCell className="py-3">
                      {getMovementBadge(m.type, m.reason)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-bold text-foreground text-sm">
                        {m.product?.name || 'Product'}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit mt-0.5">
                        {m.product?.sku || m.productId}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-semibold text-foreground">
                        {m.warehouse?.name || 'Assigned Warehouse'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-3">
                      {formatQuantity(m.type, m.quantity, m.reason)}{' '}
                      <span className="text-xs font-semibold text-muted-foreground">
                        {m.product?.unit || 'pcs'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground max-w-xs truncate py-3">
                      {m.reason || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Always Visible Pagination Bar with Rows-Per-Page Selector */}
          <Pagination
            currentPage={validPage}
            totalPages={totalPages}
            totalItems={filteredMovements.length}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 25, 50]}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
            alwaysVisible={true}
          />
        </div>
      )}
    </section>
  );
}
