'use client';

import { useEffect, type SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import { Page } from '@shared/ui/components';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  addExerciseRow,
  addSetRow,
  removeExerciseRow,
  removeSetRow,
  resetLoggerDraft,
  setExerciseName,
  setLoggerPerformedAt,
  setLoggerTitle,
  setSetField,
} from '@/lib/store/workouts.slice';
import { createWorkout, type CreateWorkoutInput } from '@/lib/workouts-api';
import { WorkoutForm } from './workout-form';
import {
  isDraftValid,
  todayDateInput,
  toWorkoutExercisesInput,
} from '../workout-draft-utils';

function getSubmitErrorMessage(error: unknown): string {
  return error instanceof ApiClientError ? error.message : 'Failed to save workout';
}

function toCreateWorkoutInput(
  title: string,
  performedAt: string,
  exercises: Parameters<typeof toWorkoutExercisesInput>[0],
): CreateWorkoutInput {
  return {
    title: title.trim(),
    performedAt: new Date(performedAt).toISOString(),
    exercises: toWorkoutExercisesInput(exercises),
  };
}

export default function NewWorkoutPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useAppSelector((state) => state.workouts.logger);

  useEffect(() => {
    if (!draft.performedAt) {
      dispatch(setLoggerPerformedAt(todayDateInput()));
    }
  }, []);

  const mutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      void queryClient.invalidateQueries({ queryKey: ['prs'] });
      dispatch(resetLoggerDraft());
      router.push('/workouts');
    },
  });

  const canSubmit =
    draft.title.trim().length > 0 &&
    draft.performedAt !== '' &&
    isDraftValid(draft.exercises);

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || mutation.isPending) return;
    mutation.mutate(
      toCreateWorkoutInput(draft.title, draft.performedAt, draft.exercises),
    );
  }

  function onCancel() {
    dispatch(resetLoggerDraft());
    router.push('/workouts');
  }

  const submitError = mutation.isError
    ? getSubmitErrorMessage(mutation.error)
    : undefined;

  return (
    <Page>
      {/* <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Workouts', href: '/workouts' },
          { label: 'Add workout' },
        ]}
      /> */}
      <WorkoutForm
        mode="create"
        title={draft.title}
        performedAt={draft.performedAt}
        exercises={draft.exercises}
        disabled={mutation.isPending}
        canSubmit={canSubmit}
        submitError={submitError}
        onTitleChange={(value) => dispatch(setLoggerTitle(value))}
        onDateChange={(value) => dispatch(setLoggerPerformedAt(value))}
        onExerciseNameChange={(exerciseIndex, name) =>
          dispatch(setExerciseName({ index: exerciseIndex, name }))
        }
        onAddExercise={() => dispatch(addExerciseRow())}
        onRemoveExercise={(exerciseIndex) => dispatch(removeExerciseRow(exerciseIndex))}
        onAddSet={(exerciseIndex) => dispatch(addSetRow(exerciseIndex))}
        onRemoveSet={(exerciseIndex, setIndex) =>
          dispatch(removeSetRow({ exerciseIndex, setIndex }))
        }
        onSetFieldChange={(exerciseIndex, setIndex, field, value) =>
          dispatch(setSetField({ exerciseIndex, setIndex, field, value }))
        }
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </Page>
  );
}
