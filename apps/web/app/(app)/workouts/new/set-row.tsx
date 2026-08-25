'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TableCell, TableRow, TextInput } from '@shared/ui/components';
import { cn } from '@shared/ui';
import type { DraftSet } from '@/lib/store/workouts.slice';

export type SetRowProps = Readonly<{
  set: DraftSet;
  exerciseIndex: number;
  setIndex: number;
  disabled: boolean;
  /** Plays a brief fade/slide-in transition — set when this row was just added. */
  animateIn?: boolean;
  onChange: (field: keyof DraftSet, value: string) => void;
  onRemove: () => void;
}>;

export function SetRow({
  set,
  exerciseIndex,
  setIndex,
  disabled,
  animateIn = false,
  onChange,
  onRemove,
}: SetRowProps) {
  const [entered, setEntered] = useState(!animateIn);
  const repsId = `exercise-${exerciseIndex}-set-${setIndex}-reps`;
  const weightId = `exercise-${exerciseIndex}-set-${setIndex}-weight`;

  useEffect(() => {
    if (!animateIn) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [animateIn]);

  return (
    <TableRow
      className={cn(
        'transition-all duration-200 ease-out',
        entered ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
      )}
    >
      <TableCell className="text-muted-foreground">{setIndex + 1}</TableCell>
      <TableCell>
        <label htmlFor={repsId} className="sr-only">
          Set {setIndex + 1} reps
        </label>
        <TextInput
          id={repsId}
          type="number"
          min={0}
          inputMode="numeric"
          required
          disabled={disabled}
          value={set.reps}
          onChange={(e) => onChange('reps', e.target.value)}
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <label htmlFor={weightId} className="sr-only">
          Set {setIndex + 1} weight in kilograms
        </label>
        <TextInput
          id={weightId}
          type="number"
          min={0}
          step="0.5"
          inputMode="decimal"
          placeholder="Optional"
          disabled={disabled}
          value={set.weightKg}
          onChange={(e) => onChange('weightKg', e.target.value)}
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          aria-label={`Remove set ${setIndex + 1}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </TableCell>
    </TableRow>
  );
}
