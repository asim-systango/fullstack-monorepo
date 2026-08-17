'use client';

import type { TicketPriority, TicketStatus } from '@shared/api-client';
import { Button, Card, Field, Select, TextInput } from '@shared/ui/components';
import { useCategories } from '@/lib/hooks/use-categories';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  resetFilters,
  setCategoryId,
  setPriority,
  setSearch,
  setStatus,
} from '@/lib/store/ticket-filters-slice';

export function AgentInboxFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.ticketFilters);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();

  const isFiltered =
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.search?.trim());

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 items-end">
        <Field label="Search" htmlFor="filter-search">
          <TextInput
            id="filter-search"
            placeholder="Search tickets..."
            value={filters.search ?? ''}
            onChange={(e) => dispatch(setSearch(e.target.value))}
          />
        </Field>

        <Field label="Status" htmlFor="filter-status">
          <Select
            id="filter-status"
            value={filters.status ?? ''}
            onChange={(e) => dispatch(setStatus(e.target.value as TicketStatus | ''))}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
        </Field>

        <Field label="Priority" htmlFor="filter-priority">
          <Select
            id="filter-priority"
            value={filters.priority ?? ''}
            onChange={(e) => dispatch(setPriority(e.target.value as TicketPriority | ''))}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>

        <Field label="Category" htmlFor="filter-category">
          <Select
            id="filter-category"
            value={filters.categoryId ?? ''}
            disabled={isCategoriesLoading}
            onChange={(e) => dispatch(setCategoryId(e.target.value))}
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {isFiltered && (
        <div className="flex justify-end mt-4 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => dispatch(resetFilters())}>
            Clear Filters
          </Button>
        </div>
      )}
    </Card>
  );
}
