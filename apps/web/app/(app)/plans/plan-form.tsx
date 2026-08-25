'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ApiClientError } from '@shared/api-client';
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Form,
  StatusMessage,
  TextArea,
  TextInput,
} from '@shared/ui/components';
import type { CreatePlanInput, PlanDayInput, PlanExercise } from '@/lib/plans-api';
import { DayCard, type DraftDay } from './day-card';

function emptyDay(): DraftDay {
  return {
    dayLabel: '',
    exercises: [{ exerciseName: '', targetSets: 3, targetReps: 8 }],
  };
}

function toInput(title: string, notes: string, days: DraftDay[]): CreatePlanInput {
  return {
    title: title.trim(),
    notes: notes.trim() || undefined,
    days: days.map((day, index): PlanDayInput => ({
      dayLabel: day.dayLabel.trim(),
      order: index,
      exercises: day.exercises.map((ex) => ({
        exerciseName: ex.exerciseName.trim(),
        targetSets: Number(ex.targetSets),
        targetReps: Number(ex.targetReps),
      })),
    })),
  };
}

function isValid(title: string, days: DraftDay[]): boolean {
  if (title.trim().length === 0 || days.length === 0) return false;
  return days.every(
    (day) =>
      day.dayLabel.trim().length > 0 &&
      day.exercises.length > 0 &&
      day.exercises.every(
        (ex) =>
          ex.exerciseName.trim().length > 0 && ex.targetSets > 0 && ex.targetReps > 0,
      ),
  );
}

function replaceDay(
  days: DraftDay[],
  index: number,
  patch: Partial<DraftDay>,
): DraftDay[] {
  return days.map((day, i) => (i === index ? { ...day, ...patch } : day));
}

function replaceExercise(
  days: DraftDay[],
  dayIndex: number,
  exerciseIndex: number,
  patch: Partial<PlanExercise>,
): DraftDay[] {
  return days.map((day, i) =>
    i !== dayIndex
      ? day
      : {
          ...day,
          exercises: day.exercises.map((ex, j) =>
            j === exerciseIndex ? { ...ex, ...patch } : ex,
          ),
        },
  );
}

function addExerciseToDay(days: DraftDay[], dayIndex: number): DraftDay[] {
  const day = days[dayIndex];
  if (!day) return days;
  return replaceDay(days, dayIndex, {
    exercises: [...day.exercises, { exerciseName: '', targetSets: 3, targetReps: 8 }],
  });
}

function removeExerciseFromDayAt(
  exercises: PlanExercise[],
  exerciseIndex: number,
): PlanExercise[] {
  return exercises.filter((_, j) => j !== exerciseIndex);
}

function removeExerciseFromDay(
  days: DraftDay[],
  dayIndex: number,
  exerciseIndex: number,
): DraftDay[] {
  const day = days[dayIndex];
  if (!day) return days;
  return replaceDay(days, dayIndex, {
    exercises: removeExerciseFromDayAt(day.exercises, exerciseIndex),
  });
}

function removeDayAt(days: DraftDay[], dayIndex: number): DraftDay[] {
  return days.filter((_, i) => i !== dayIndex);
}

export type PlanFormMode = 'create' | 'edit';

export type PlanFormProps = Readonly<{
  mode: PlanFormMode;
  initialTitle?: string;
  initialNotes?: string;
  initialDays?: DraftDay[];
  pending: boolean;
  error?: unknown;
  onSubmit: (input: CreatePlanInput) => void;
  onCancel?: () => void;
}>;

const COPY: Record<
  PlanFormMode,
  {
    heading: string;
    description: string;
    submitLabel: string;
    submitPendingLabel: string;
  }
> = {
  create: {
    heading: 'Create plan',
    description: 'Build a template with days and target sets/reps per exercise.',
    submitLabel: 'Save plan',
    submitPendingLabel: 'Saving…',
  },
  edit: {
    heading: 'Update plan',
    description: 'Update your plan details.',
    submitLabel: 'Update plan',
    submitPendingLabel: 'Updating…',
  },
};

export function PlanForm({
  mode,
  initialTitle = '',
  initialNotes = '',
  initialDays,
  pending,
  error,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState(initialNotes);
  const [days, setDays] = useState<DraftDay[]>(initialDays ?? [emptyDay()]);
  const copy = COPY[mode];

  const canSubmit = isValid(title, days) && !pending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground">
          {copy.heading}
        </h1>
        <p className="mt-1 mb-0 text-sm text-muted-foreground">{copy.description}</p>
      </div>

      <Form
        pending={pending}
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          onSubmit(toInput(title, notes, days));
        }}
        className="space-y-6"
      >
        <Card>
          <CardBody>
            <div>
              <Field label="Title" htmlFor="plan-title" required disabled={pending}>
                <TextInput
                  id="plan-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Push/Pull/Legs"
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Notes" htmlFor="plan-notes" disabled={pending}>
                <TextArea
                  id="plan-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </Field>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardBody>
              <h2 className="m-0 mb-4 text-base font-semibold text-foreground">Days</h2>

              {days.length === 0 ? (
                <EmptyState
                  title="No days added yet."
                  description="Start building your plan."
                  action={
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => setDays((prev) => [...prev, emptyDay()])}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Add day
                    </Button>
                  }
                />
              ) : (
                <>
                  {days.map((day, dayIndex) => (
                    <DayCard
                      key={dayIndex}
                      dayIndex={dayIndex}
                      day={day}
                      disabled={pending}
                      onChangeLabel={(dayLabel) =>
                        setDays((prev) => replaceDay(prev, dayIndex, { dayLabel }))
                      }
                      onChangeExercise={(exerciseIndex, patch) =>
                        setDays((prev) =>
                          replaceExercise(prev, dayIndex, exerciseIndex, patch),
                        )
                      }
                      onAddExercise={() =>
                        setDays((prev) => addExerciseToDay(prev, dayIndex))
                      }
                      onRemoveExercise={(exerciseIndex) =>
                        setDays((prev) =>
                          removeExerciseFromDay(prev, dayIndex, exerciseIndex),
                        )
                      }
                      onRemoveDay={() => setDays((prev) => removeDayAt(prev, dayIndex))}
                    />
                  ))}

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setDays((prev) => [...prev, emptyDay()])}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary bg-primary/10 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add day
                  </button>
                </>
              )}
            </CardBody>
          </Card>
        </div>

        {error ? (
          <StatusMessage tone="error">
            {error instanceof ApiClientError ? error.message : 'Failed to save plan'}
          </StatusMessage>
        ) : null}

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={onCancel}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={pending}
            loadingText={copy.submitPendingLabel}
            className="min-w-[150px]"
          >
            {copy.submitLabel}
          </Button>
        </div>
      </Form>
    </div>
  );
}
