'use client';

import { Button, Field, TextInput } from '@shared/ui/components';
import {
  applyRestaurantFilters,
  clearRestaurantFilters,
  setRestaurantCuisineDraft,
  setRestaurantSearchDraft,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

export function RestaurantFiltersBar() {
  const dispatch = useAppDispatch();
  const cuisine = useAppSelector((s) => s.filters.restaurantCuisineDraft);
  const search = useAppSelector((s) => s.filters.restaurantSearchDraft);

  return (
    <form
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch(applyRestaurantFilters());
      }}
    >
      <Field label="Cuisine" htmlFor="filter-cuisine">
        <TextInput
          id="filter-cuisine"
          value={cuisine}
          placeholder="e.g. Indian"
          onChange={(e) => dispatch(setRestaurantCuisineDraft(e.target.value))}
        />
      </Field>
      <Field label="Search" htmlFor="filter-search">
        <TextInput
          id="filter-search"
          value={search}
          placeholder="Name or area"
          onChange={(e) => dispatch(setRestaurantSearchDraft(e.target.value))}
        />
      </Field>
      <Button type="submit" className="self-end">
        Apply
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="self-end"
        onClick={() => dispatch(clearRestaurantFilters())}
      >
        Clear
      </Button>
    </form>
  );
}
