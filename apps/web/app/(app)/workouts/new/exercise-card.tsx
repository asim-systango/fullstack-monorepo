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
  EmptyState,
  Field,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextInput,
} from '@shared/ui/components';
import type { DraftExercise, DraftSet } from '@/lib/store/workouts.slice';
import { SetRow } from './set-row';

export type ExerciseCardProps = Readonly<{
  exercise: DraftExercise;
  exerciseIndex: number;
  disabled: boolean;
  onNameChange: (name: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onSetFieldChange: (setIndex: number, field: keyof DraftSet, value: string) => void;
  onRemoveExercise: () => void;
}>;

export function ExerciseCard({
  exercise,
  exerciseIndex,
  disabled,
  onNameChange,
  onAddSet,
  onRemoveSet,
  onSetFieldChange,
  onRemoveExercise,
}: ExerciseCardProps) {
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [justAddedSetIndex, setJustAddedSetIndex] = useState<number | null>(null);
  const nameId = `exercise-${exerciseIndex}-name`;
  const exerciseLabel = exercise.exerciseName.trim() || `Exercise ${exerciseIndex + 1}`;

  function handleAddSet() {
    setJustAddedSetIndex(exercise.sets.length);
    onAddSet();
  }

  return (
    <Card className="bg-transparent shadow-none border border-lightgray">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Field
            label="Exercise Name"
            htmlFor={nameId}
            required
            disabled={disabled}
            className="mb-0 flex-1"
          >
            <TextInput
              id={nameId}
              value={exercise.exerciseName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Bench Press"
            />
          </Field>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setConfirmingRemove(true)}
            aria-label={`Remove ${exerciseLabel}`}
            className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-md text-destructive transition-colors bg-destructive/10  hover:bg-destructive/20 hover:text-destructive disabled:pointer-events-none disabled:opacity-50 py-2 px-3"
          >
            <Trash2 className="size-4 mr-2" aria-hidden="true" /> Delete
          </button>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-12">Set</TableHeaderCell>
              <TableHeaderCell>Reps</TableHeaderCell>
              <TableHeaderCell>Weight (kg)</TableHeaderCell>
              <TableHeaderCell aria-label="Actions" className="w-16" />
            </TableRow>
          </TableHead>
          <TableBody>
            {exercise.sets.length === 0 ? (
              <TableRow>
                <TableCell className="text-muted-foreground" colSpan={4}>
                  <EmptyState title="No Sets added yet." />
                </TableCell>
              </TableRow>
            ) : (
              exercise.sets.map((set, setIndex) => (
                <SetRow
                  key={setIndex}
                  set={set}
                  exerciseIndex={exerciseIndex}
                  setIndex={setIndex}
                  disabled={disabled}
                  animateIn={setIndex === justAddedSetIndex}
                  onChange={(field, value) => onSetFieldChange(setIndex, field, value)}
                  onRemove={() => onRemoveSet(setIndex)}
                />
              ))
            )}
          </TableBody>
        </Table>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={handleAddSet}
          className="border-1 border-dashed border-border bg-primary/10 py-2 px-4 text-sm font-medium text-primary-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="size-4 mr-2" aria-hidden="true" />
          Add set
        </Button>
      </CardBody>

      <Dialog open={confirmingRemove} onOpenChange={setConfirmingRemove} className="">
        <DialogHeader>
          <DialogTitle>Remove exercise?</DialogTitle>
        </DialogHeader>
        <DialogBody>Remove {exerciseLabel} from this workout?</DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setConfirmingRemove(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmingRemove(false);
              onRemoveExercise();
            }}
            className="text-white"
          >
            Remove
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}
