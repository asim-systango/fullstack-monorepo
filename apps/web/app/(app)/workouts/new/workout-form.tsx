'use client';

import type { SyntheticEvent } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Form,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import type { DraftExercise, DraftSet } from '@/lib/store/workouts.slice';
import { ExerciseCard } from './exercise-card';

export type WorkoutFormMode = 'create' | 'edit';

export type WorkoutFormProps = Readonly<{
  mode: WorkoutFormMode;
  title: string;
  performedAt: string;
  exercises: DraftExercise[];
  disabled: boolean;
  canSubmit: boolean;
  submitError?: string;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onExerciseNameChange: (exerciseIndex: number, name: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onSetFieldChange: (
    exerciseIndex: number,
    setIndex: number,
    field: keyof DraftSet,
    value: string,
  ) => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}>;

const COPY: Record<
  WorkoutFormMode,
  {
    heading: string;
    description: string;
    submitLabel: string;
    submitPendingLabel: string;
  }
> = {
  create: {
    heading: 'Create workout',
    description: "Track today's workout and monitor your progress.",
    submitLabel: 'Save workout',
    submitPendingLabel: 'Saving…',
  },
  edit: {
    heading: 'Update workout',
    description: 'Update your workout details.',
    submitLabel: 'Update workout',
    submitPendingLabel: 'Updating…',
  },
};

export function WorkoutForm({
  mode,
  title,
  performedAt,
  exercises,
  disabled,
  canSubmit,
  submitError,
  onTitleChange,
  onDateChange,
  onExerciseNameChange,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onSetFieldChange,
  onSubmit,
  onCancel,
}: WorkoutFormProps) {
  const copy = COPY[mode];

  return (
    <div className=" space-y-6">
      <div>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground">
          {copy.heading}
        </h1>
        <p className="mt-1 mb-0 text-sm text-muted-foreground">{copy.description}</p>
      </div>

      <Form pending={disabled} onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardBody className="space-y-4 flex gap-3">
            <div className="flex-1">
              <Field
                label="Workout Name"
                htmlFor="workout-title"
                required
                disabled={disabled}
              >
                <TextInput
                  id="workout-title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Ex: Chest Day"
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field
                label="Workout date"
                htmlFor="workout-date"
                required
                disabled={disabled}
              >
                <TextInput
                  id="workout-date"
                  type="date"
                  value={performedAt}
                  onChange={(e) => onDateChange(e.target.value)}
                />
              </Field>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 ui-card">
          <h2 className="m-0 text-base font-semibold text-foreground mb-4">Exercises</h2>

          {exercises.length === 0 ? (
            <EmptyState
              title="No exercises added yet."
              description="Start building your workout."
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onAddExercise}
                  disabled={disabled}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add exercise
                </Button>
              }
            />
          ) : (
            <>
              {exercises.map((exercise, exerciseIndex) => (
                <ExerciseCard
                  key={exerciseIndex}
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  disabled={disabled}
                  onNameChange={(name) => onExerciseNameChange(exerciseIndex, name)}
                  onAddSet={() => onAddSet(exerciseIndex)}
                  onRemoveSet={(setIndex) => onRemoveSet(exerciseIndex, setIndex)}
                  onSetFieldChange={(setIndex, field, value) =>
                    onSetFieldChange(exerciseIndex, setIndex, field, value)
                  }
                  onRemoveExercise={() => onRemoveExercise(exerciseIndex)}
                />
              ))}

              <button
                type="button"
                disabled={disabled}
                onClick={onAddExercise}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary bg-primary/10 py-3 text-sm font-medium text-primary transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
              >
                <Plus className="size-4 mr-2" aria-hidden="true" />
                Add exercise
              </button>
            </>
          )}
        </div>

        {submitError ? <StatusMessage tone="error">{submitError}</StatusMessage> : null}

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={disabled}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={disabled}
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
