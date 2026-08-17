'use client';

import { Field, TextInput } from '@shared/ui/components';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setWorkoutFilter } from '@/lib/store/workouts.slice';

export function WorkoutsFilterBar() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.workouts.appliedFilter);

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <Field label="Exercise" htmlFor="filter-exercise" className="sm:w-[350px] w-full">
        <TextInput
          id="filter-exercise"
          value={filter.exercise}
          onChange={(e) => dispatch(setWorkoutFilter({ exercise: e.target.value }))}
          placeholder="Search by exercise name, workout name..."
        />
      </Field>
      <Field label="From" htmlFor="filter-date-from" className="sm:w-[180px] w-full">
        <TextInput
          id="filter-date-from"
          type="date"
          value={filter.dateFrom}
          onChange={(e) => dispatch(setWorkoutFilter({ dateFrom: e.target.value }))}
        />
      </Field>
      <Field label="To" htmlFor="filter-date-to" className="sm:w-[180px] w-full">
        <TextInput
          id="filter-date-to"
          type="date"
          value={filter.dateTo}
          onChange={(e) => dispatch(setWorkoutFilter({ dateTo: e.target.value }))}
        />
      </Field>
    </div>
  );
}
