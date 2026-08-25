'use client';

import { Trash2 } from 'lucide-react';
import { Field, TextInput } from '@shared/ui/components';
import type { PlanExercise } from '@/lib/plans-api';

export type ExerciseFieldRowProps = Readonly<{
  dayIndex: number;
  exerciseIndex: number;
  exercise: PlanExercise;
  disabled: boolean;
  onChange: (patch: Partial<PlanExercise>) => void;
  onRemove: () => void;
}>;

export function ExerciseFieldRow({
  dayIndex,
  exerciseIndex,
  exercise,
  disabled,
  onChange,
  onRemove,
}: ExerciseFieldRowProps) {
  const nameId = `day-${dayIndex}-ex-${exerciseIndex}-name`;
  const setsId = `day-${dayIndex}-ex-${exerciseIndex}-sets`;
  const repsId = `day-${dayIndex}-ex-${exerciseIndex}-reps`;

  return (
    <div className="ui-form-row items-center  flex gap-3">
      <Field
        label="Exercise"
        htmlFor={nameId}
        required
        disabled={disabled}
        className="flex-1"
      >
        <TextInput
          id={nameId}
          value={exercise.exerciseName}
          onChange={(e) => onChange({ exerciseName: e.target.value })}
          placeholder="e.g. Bench Press"
        />
      </Field>
      <Field label="Sets" htmlFor={setsId} disabled={disabled} className="flex-1">
        <TextInput
          id={setsId}
          type="number"
          min={1}
          value={exercise.targetSets}
          onChange={(e) => onChange({ targetSets: Number(e.target.value) })}
        />
      </Field>
      <Field label="Reps" htmlFor={repsId} disabled={disabled} className="flex-1">
        <TextInput
          id={repsId}
          type="number"
          min={1}
          value={exercise.targetReps}
          onChange={(e) => onChange({ targetReps: Number(e.target.value) })}
        />
      </Field>
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remove exercise ${exerciseIndex + 1} from day ${dayIndex + 1}`}
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
