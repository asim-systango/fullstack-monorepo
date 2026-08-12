'use client';

import { useState, useMemo } from 'react';
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
  LoadingState,
  EmptyState,
  type BadgeTone,
} from '@shared/ui/components';
import { useMovements, type MovementType } from '@/lib/hooks/use-movements';
import { useWarehouses } from '@/lib/hooks/use-warehouses';

export function MovementTable() {
  const { data: warehouses = [] } = useWarehouses();
  const staffWarehouse = warehouses[0]; // Logged-in staff member's assigned facility

  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch movements strictly filtered to the staff member's assigned warehouse
  const {
    data: movements = [],
    isLoading,
    error,
  } = useMovements({
    warehouseId: staffWarehouse?.id,
    type: (selectedType as MovementType) || undefined,
  });

  // Client-side search filtering by SKU, product name, or order reason
  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) return movements;
    const query = searchQuery.toLowerCase().trim();
    return movements.filter((m) => {
      const pName = m.product?.name?.toLowerCase() || '';
      const sku = m.product?.sku?.toLowerCase() || '';
      const reason = m.reason?.toLowerCase() || '';
      return pName.includes(query) || sku.includes(query) || reason.includes(query);
    });
  }, [movements, searchQuery]);

  const getMovementBadge = (type: MovementType) => {
    let tone: BadgeTone = 'neutral';
    let label = 'Adjustment';
    let icon = '⇄';

    if (type === 'outbound') {
      tone = 'danger';
      label = 'Outbound (Order Fulfillment)';
      icon = '↘';
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

  const formatQuantity = (type: MovementType, qty: number) => {
    if (type === 'outbound') {
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
      {/* Filter Toolbar Section (No warehouse selector for staff) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Audit Records ({filteredMovements.length} logged)
        </span>
        {(searchQuery || selectedType) && (
          <button
            type="button"
            className="text-xs font-semibold text-accent hover:underline"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>

      {/* Full-width Data Table */}
      {filteredMovements.length === 0 ? (
        <EmptyState
          title="No stock movements recorded"
          description="Process an outbound order fulfillment or inbound shipment using the form above."
        />
      ) : (
        <div className="w-full overflow-x-auto border-y border-border/80 bg-background">
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
                  Qty Change
                </TableHeaderCell>
                <TableHeaderCell className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                  Reason / Order Ref
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMovements.map((m) => (
                <TableRow
                  key={m.id}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-medium py-3">
                    {formatDate(m.createdAt)}
                  </TableCell>
                  <TableCell className="py-3">{getMovementBadge(m.type)}</TableCell>
                  <TableCell className="py-3">
                    <div className="font-bold text-foreground text-sm">
                      {m.product?.name || 'Product'}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit mt-0.5">
                      {m.product?.sku || m.productId}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3">
                    {formatQuantity(m.type, m.quantity)}{' '}
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
      )}
    </section>
  );
}
