'use client';

import { useEffect, useRef, type SyntheticEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import { Alert, Button, LoadingState, Page } from '@shared/ui/components';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  addExerciseRow,
  addSetRow,
  loadLoggerDraft,
  removeExerciseRow,
  removeSetRow,
  resetLoggerDraft,
  setExerciseName,
  setLoggerPerformedAt,
  setLoggerTitle,
  setSetField,
} from '@/lib/store/workouts.slice';
import { fetchWorkout, updateWorkout, type UpdateWorkoutInput } from '@/lib/workouts-api';
import { WorkoutForm } from '../../new/workout-form';
import {
  dateOnlyInput,
  isDraftValid,
  toWorkoutExercisesInput,
  workoutToDraftExercises,
} from '../../workout-draft-utils';

function getSubmitErrorMessage(error: unknown): string {
  return error instanceof ApiClientError ? error.message : 'Failed to update workout';
}

export default function EditWorkoutPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useAppSelector((state) => state.workouts.logger);
  const hasLoadedDraft = useRef(false);

  const query = useQuery({ queryKey: ['workouts', id], queryFn: () => fetchWorkout(id) });

  useEffect(() => {
    if (hasLoadedDraft.current || !query.data) return;
    hasLoadedDraft.current = true;
    const workout = query.data;
    dispatch(
      loadLoggerDraft({
        title: workout.title,
        performedAt: dateOnlyInput(workout.performedAt),
        exercises: workoutToDraftExercises(workout),
      }),
    );
  }, [dispatch, query.data]);

  useEffect(() => {
    return () => {
      hasLoadedDraft.current = false;
    };
  }, []);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateWorkoutInput) => updateWorkout(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['workouts'] });
      void queryClient.invalidateQueries({ queryKey: ['prs'] });
      dispatch(resetLoggerDraft());
      router.push('/workouts');
    },
  });

  const canSubmit =
    hasLoadedDraft.current &&
    draft.title.trim().length > 0 &&
    draft.performedAt !== '' &&
    isDraftValid(draft.exercises);

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || updateMutation.isPending) return;
    updateMutation.mutate({
      title: draft.title.trim(),
      performedAt: new Date(draft.performedAt).toISOString(),
      exercises: toWorkoutExercisesInput(draft.exercises),
    });
  }

  function onCancel() {
    dispatch(resetLoggerDraft());
    router.push('/workouts');
  }

  return (
    <Page>
      {query.isLoading ? <LoadingState variant="block" label="Loading workout…" /> : null}

      {query.isError ? (
        <Alert tone="danger" title="Couldn't load workout">
          <Button size="sm" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {query.isSuccess && hasLoadedDraft.current ? (
        <WorkoutForm
          mode="edit"
          title={draft.title}
          performedAt={draft.performedAt}
          exercises={draft.exercises}
          disabled={updateMutation.isPending}
          canSubmit={canSubmit}
          submitError={
            updateMutation.isError
              ? getSubmitErrorMessage(updateMutation.error)
              : undefined
          }
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
      ) : null}
    </Page>
  );
}
