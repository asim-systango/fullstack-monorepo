'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, TextInput, Checkbox, Badge } from '@shared/ui';
import type { Category } from '@/lib/hooks/use-categories';

type ProductToolbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedCategoryIds: string[];
  onCategoryToggle: (categoryId: string) => void;
  onSelectAllCategories: () => void;
  onClearCategories: () => void;
  onResetFilters: () => void;
};

export function ProductToolbar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategoryIds,
  onCategoryToggle,
  onSelectAllCategories,
  onClearCategories,
  onResetFilters,
}: Readonly<ProductToolbarProps>) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedCategoryIds.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search and category filters */}
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="w-full sm:w-72">
            <TextInput
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="relative" ref={popoverRef}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2"
              aria-expanded={isCategoryOpen}
              aria-haspopup="true"
            >
              <span>Category Filter</span>
              {selectedCategoryIds.length > 0 ? (
                <Badge tone="accent" className="ml-1">
                  {selectedCategoryIds.length} selected
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">(All)</span>
              )}
              <svg
                className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="19 9l-7 7-7-7"
                />
              </svg>
            </Button>

            {/* Category dropdown with check marks */}
            {isCategoryOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-border bg-popover p-3 shadow-lg bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Categories
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onSelectAllCategories}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-xs text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={onClearCategories}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {categories.length === 0 ? (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    No categories available
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 py-1">
                    {categories.map((category) => {
                      const isChecked = selectedCategoryIds.includes(category.id);
                      return (
                        <div
                          key={category.id}
                          className="flex items-center rounded-md px-2 py-1.5 hover:bg-accent transition-colors cursor-pointer"
                        >
                          <Checkbox
                            id={`category-chk-${category.id}`}
                            label={category.name}
                            checked={isChecked}
                            onChange={() => onCategoryToggle(category.id)}
                            className="w-full text-sm cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" type="button" onClick={onResetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Selected Category Badges Bar */}
      {selectedCategoryIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground font-medium">Selected categories:</span>
          {categories
            .filter((cat) => selectedCategoryIds.includes(cat.id))
            .map((cat) => (
              <Badge
                key={cat.id}
                tone="accent"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => onCategoryToggle(cat.id)}
                title="Click to remove category"
              >
                <span>{cat.name}</span>
                <span className="ml-1 font-bold">×</span>
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
