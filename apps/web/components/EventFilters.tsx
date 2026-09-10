'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  resetFilters,
  setCategoryFilter,
  setDateRange,
  setSearchQuery,
  setStatusFilter,
  setViewMode,
} from '@/lib/store/eventsFilterSlice';
import { Button, Select, TextInput } from '@shared/ui/components';
import { Calendar } from 'lucide-react';

const CATEGORIES = ['ALL', 'Technology', 'Workshop', 'Design', 'Security', 'Business', 'General'];

export function EventFilters() {
  const dispatch = useAppDispatch();
  const { q, category, status, startDate, endDate, viewMode } = useAppSelector(
    (state) => state.eventsFilter,
  );

  const hasActiveFilters = Boolean(
    q || category !== 'ALL' || status !== 'ALL' || startDate || endDate,
  );

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4 shadow-xs transition-all">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <TextInput
            placeholder="Search events by title, description, or location..."
            value={q}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-9 text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <Select
            value={status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="w-40 sm:w-44 text-xs font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border/60 bg-secondary/30 p-0.5">
            <button
              type="button"
              onClick={() => dispatch(setViewMode('grid'))}
              className={`rounded-md p-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => dispatch(setViewMode('table'))}
              className={`rounded-md p-1.5 text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(resetFilters())}
              className="text-xs font-semibold"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Date Range & Category Row */}
      <div className="flex flex-col gap-3 border-t border-border/40 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between flex-wrap">
        {/* Date Range Inputs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Dates:</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-[11px]">From</span>
            <TextInput
              type="date"
              value={startDate ? startDate.slice(0, 10) : ''}
              onChange={(e) =>
                dispatch(
                  setDateRange({
                    startDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                    endDate,
                  }),
                )
              }
              className="w-36 text-xs h-8 py-1"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-[11px]">To</span>
            <TextInput
              type="date"
              value={endDate ? endDate.slice(0, 10) : ''}
              onChange={(e) =>
                dispatch(
                  setDateRange({
                    startDate,
                    endDate: e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : '',
                  }),
                )
              }
              className="w-36 text-xs h-8 py-1"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted-foreground">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => dispatch(setCategoryFilter(cat))}
              className={`rounded-full px-3 py-1 font-medium transition-all ${
                category === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
