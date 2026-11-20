'use client';

import { useRouter } from 'next/navigation';
import { Button, Field, Select, TextInput } from '@shared/ui/components';
import { AUCTION_CATEGORIES } from '@/lib/auction-utils';
import {
  applyFilter,
  clearFilters,
  filtersToSearchParams,
  setFilterField,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

export function AuctionFilters() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const draft = useAppSelector((s) => s.ui.filterDraft);

  return (
    <form
      className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(applyFilter());
        const qs = filtersToSearchParams(draft);
        router.replace(qs ? `/auctions?${qs}` : '/auctions');
      }}
    >
      <Field label="Search" htmlFor="filter-q">
        <TextInput
          id="filter-q"
          name="q"
          value={draft.q}
          placeholder="Title or description"
          onChange={(e) => dispatch(setFilterField({ key: 'q', value: e.target.value }))}
        />
      </Field>
      <Field label="Category" htmlFor="filter-category">
        <Select
          id="filter-category"
          name="category"
          value={draft.category}
          onChange={(e) =>
            dispatch(setFilterField({ key: 'category', value: e.target.value }))
          }
        >
          <option value="">All</option>
          {AUCTION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Status" htmlFor="filter-status">
        <Select
          id="filter-status"
          name="status"
          value={draft.status}
          onChange={(e) =>
            dispatch(setFilterField({ key: 'status', value: e.target.value }))
          }
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Field>
      <Field label="Min price" htmlFor="filter-min">
        <TextInput
          id="filter-min"
          name="minPrice"
          type="number"
          min={0}
          step="0.01"
          value={draft.minPrice}
          onChange={(e) =>
            dispatch(setFilterField({ key: 'minPrice', value: e.target.value }))
          }
        />
      </Field>
      <Field label="Max price" htmlFor="filter-max">
        <TextInput
          id="filter-max"
          name="maxPrice"
          type="number"
          min={0}
          step="0.01"
          value={draft.maxPrice}
          onChange={(e) =>
            dispatch(setFilterField({ key: 'maxPrice', value: e.target.value }))
          }
        />
      </Field>
      <div className="flex items-end gap-2">
        <Button type="submit">Apply</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            dispatch(clearFilters());
            router.replace('/auctions');
          }}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
