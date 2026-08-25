'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  TextInput,
} from '@shared/ui/components';
import type { PlanExercise } from '@/lib/plans-api';
import { ExerciseFieldRow } from './exercise-field-row';

export type DraftDay = { dayLabel: string; exercises: PlanExercise[] };

export type DayCardProps = Readonly<{
  dayIndex: number;
  day: DraftDay;
  disabled: boolean;
  onChangeLabel: (dayLabel: string) => void;
  onChangeExercise: (exerciseIndex: number, patch: Partial<PlanExercise>) => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onRemoveDay: () => void;
}>;

export function DayCard({
  dayIndex,
  day,
  disabled,
  onChangeLabel,
  onChangeExercise,
  onAddExercise,
  onRemoveExercise,
  onRemoveDay,
}: DayCardProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const labelId = `day-${dayIndex}-label`;
  const dayLabel = day.dayLabel.trim() || `Day ${dayIndex + 1}`;

  return (
    <Card className="border border-lightgray bg-transparent shadow-none mb-4">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Field
            label="Day label"
            htmlFor={labelId}
            required
            disabled={disabled}
            className="mb-0 flex-1"
          >
            <TextInput
              id={labelId}
              value={day.dayLabel}
              onChange={(e) => onChangeLabel(e.target.value)}
              placeholder="e.g. Push"
            />
          </Field>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setConfirmingRemove(true)}
            aria-label={`Remove ${dayLabel}`}
            className="mt-5 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3">
          {day.exercises.map((exercise, exerciseIndex) => (
            <ExerciseFieldRow
              key={exerciseIndex}
              dayIndex={dayIndex}
              exerciseIndex={exerciseIndex}
              exercise={exercise}
              disabled={disabled}
              onChange={(patch) => onChangeExercise(exerciseIndex, patch)}
              onRemove={() => onRemoveExercise(exerciseIndex)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={onAddExercise}
          className="border border-dashed border-border bg-primary/10 text-primary hover:border-primary hover:text-primary"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add exercise
        </Button>
      </CardBody>

      <Dialog open={confirmingRemove} onOpenChange={setConfirmingRemove}>
        <DialogHeader>
          <DialogTitle>Remove day?</DialogTitle>
        </DialogHeader>
        <DialogBody>Remove {dayLabel} and all its exercises from this plan?</DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setConfirmingRemove(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmingRemove(false);
              onRemoveDay();
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}
