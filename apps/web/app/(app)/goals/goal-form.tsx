'use client';

import { useState } from 'react';
import { ApiClientError } from '@shared/api-client';
import { Button, Field, Form, StatusMessage, TextInput } from '@shared/ui/components';
import type { CreateGoalInput } from '@/lib/goals-api';

export type GoalFormProps = Readonly<{
  initialExerciseName?: string;
  initialTargetWeightKg?: number;
  initialTargetReps?: number;
  initialTargetDate?: string;
  submitLabel: string;
  pending: boolean;
  error?: unknown;
  onSubmit: (input: CreateGoalInput) => void;
  onCancel?: () => void;
}>;

export function GoalForm({
  initialExerciseName = '',
  initialTargetWeightKg,
  initialTargetReps,
  initialTargetDate = '',
  submitLabel,
  pending,
  error,
  onSubmit,
  onCancel,
}: GoalFormProps) {
  const [exerciseName, setExerciseName] = useState(initialExerciseName);
  const [targetWeightKg, setTargetWeightKg] = useState(
    initialTargetWeightKg !== undefined ? String(initialTargetWeightKg) : '',
  );
  const [targetReps, setTargetReps] = useState(
    initialTargetReps !== undefined ? String(initialTargetReps) : '',
  );
  const [targetDate, setTargetDate] = useState(initialTargetDate);

  const canSubmit =
    exerciseName.trim().length > 0 &&
    targetWeightKg !== '' &&
    Number(targetWeightKg) >= 0 &&
    !pending;

  return (
    <Form
      pending={pending}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          exerciseName: exerciseName.trim(),
          targetWeightKg: Number(targetWeightKg),
          targetReps: targetReps === '' ? undefined : Number(targetReps),
          targetDate: targetDate === '' ? undefined : targetDate,
        });
      }}
      className="space-y-4 grid grid-cols-2 gap-4"
    >
      <Field label="Exercise" htmlFor="goal-exercise" required disabled={pending}>
        <TextInput
          id="goal-exercise"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          placeholder="e.g. Bench Press"
        />
      </Field>
      <Field label="Target weight (kg)" htmlFor="goal-weight" required disabled={pending}>
        <TextInput
          id="goal-weight"
          type="number"
          min={0}
          value={targetWeightKg}
          onChange={(e) => setTargetWeightKg(e.target.value)}
        />
      </Field>
      <Field label="Target reps" htmlFor="goal-reps" disabled={pending}>
        <TextInput
          id="goal-reps"
          type="number"
          min={1}
          value={targetReps}
          onChange={(e) => setTargetReps(e.target.value)}
        />
      </Field>
      <Field label="Target date" htmlFor="goal-date" disabled={pending}>
        <TextInput
          id="goal-date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
        />
      </Field>

      {error ? (
        <StatusMessage tone="error">
          {error instanceof ApiClientError ? error.message : 'Failed to save goal'}
        </StatusMessage>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-4 col-span-2 ">
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
          loadingText="Saving…"
          className="min-w-[150px]"
        >
          {submitLabel}
        </Button>
      </div>
    </Form>
  );
}
