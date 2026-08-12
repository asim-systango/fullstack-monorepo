'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { RestaurantCard } from '@/components/food';
import { useRestaurants } from '@/lib/hooks/food-delivery';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import {
  applyRestaurantFilters,
  clearRestaurantFilters,
  setRestaurantCuisineDraft,
  setRestaurantSearchDraft,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

const CUISINES = ['All', 'Indian', 'American', 'Japanese', 'Italian'];

export default function RestaurantsPage() {
  const dispatch = useAppDispatch();
  const appliedCuisine = useAppSelector((s) => s.filters.restaurantCuisineApplied);
  const appliedSearch = useAppSelector((s) => s.filters.restaurantSearchApplied);
  const searchDraft = useAppSelector((s) => s.filters.restaurantSearchDraft);
  const debouncedSearch = useDebouncedValue(searchDraft, 350);
  const { data, isLoading, isError, error, isFetching } = useRestaurants();
  const [activeCuisine, setActiveCuisine] = useState(appliedCuisine || 'All');

  useToastQueryError(isError, error);

  // Debounced search → applied filter (triggers React Query refetch).
  useEffect(() => {
    if (debouncedSearch.trim() === appliedSearch) return;
    dispatch(applyRestaurantFilters());
  }, [debouncedSearch, appliedSearch, dispatch]);

  const count = data?.items.length ?? 0;
  const showLoading = isLoading || (isFetching && !data);

  const empty = useMemo(
    () => !showLoading && !isError && (data?.items.length ?? 0) === 0,
    [showLoading, isError, data],
  );

  function selectCuisine(c: string) {
    setActiveCuisine(c);
    dispatch(setRestaurantCuisineDraft(c === 'All' ? '' : c));
    dispatch(applyRestaurantFilters());
  }

  return (
    <AppShell>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 500, margin: 0, color: 'var(--tg-text)' }}>
            Restaurants near you
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--tg-text-muted)',
              margin: '4px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <MapPin size={13} /> Indore, Madhya Pradesh · {count} restaurants delivering
          </p>
        </div>
        <div style={{ position: 'relative', width: 'min(260px, 100%)' }}>
          <Search
            size={15}
            color="var(--tg-text-faint)"
            style={{ position: 'absolute', left: 12, top: 13 }}
          />
          <input
            className="tg-input"
            placeholder="Search restaurants or cuisines"
            style={{ paddingLeft: 34 }}
            value={searchDraft}
            onChange={(e) => dispatch(setRestaurantSearchDraft(e.target.value))}
            aria-label="Search restaurants"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {CUISINES.map((c) => (
          <button
            key={c}
            type="button"
            className={`tg-btn tg-btn-pill ${activeCuisine === c || (c === 'All' && !appliedCuisine) ? 'tg-btn-primary' : 'tg-btn-secondary'}`}
            onClick={() => {
              if (c === 'All') {
                dispatch(clearRestaurantFilters());
                setActiveCuisine('All');
              } else selectCuisine(c);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {empty ? (
        <p style={{ color: 'var(--tg-text-faint)', textAlign: 'center', padding: '40px 0' }}>
          {appliedSearch || appliedCuisine
            ? 'Nothing matched your filters.'
            : 'No restaurants yet.'}
        </p>
      ) : null}

      {!showLoading && !isError && data && data.items.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {data.items.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
