import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type DraftSet = { reps: string; weightKg: string };
export type DraftExercise = { exerciseName: string; sets: DraftSet[] };

export type WorkoutFilterDraft = {
  dateFrom: string;
  dateTo: string;
  exercise: string;
};

type WorkoutsState = {
  logger: {
    title: string;
    performedAt: string;
    exercises: DraftExercise[];
  };
  appliedFilter: WorkoutFilterDraft;
};

const emptySet = (): DraftSet => ({ reps: '', weightKg: '' });
const emptyExercise = (): DraftExercise => ({ exerciseName: '', sets: [emptySet()] });
const emptyFilter = (): WorkoutFilterDraft => ({
  dateFrom: '',
  dateTo: '',
  exercise: '',
});

const initialState: WorkoutsState = {
  logger: {
    title: '',
    performedAt: '',
    exercises: [emptyExercise()],
  },
  appliedFilter: emptyFilter(),
};

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    setLoggerTitle(state, action: PayloadAction<string>) {
      state.logger.title = action.payload;
    },
    setLoggerPerformedAt(state, action: PayloadAction<string>) {
      state.logger.performedAt = action.payload;
    },
    addExerciseRow(state) {
      state.logger.exercises.push(emptyExercise());
    },
    removeExerciseRow(state, action: PayloadAction<number>) {
      state.logger.exercises.splice(action.payload, 1);
    },
    setExerciseName(state, action: PayloadAction<{ index: number; name: string }>) {
      const exercise = state.logger.exercises[action.payload.index];
      if (exercise) exercise.exerciseName = action.payload.name;
    },
    addSetRow(state, action: PayloadAction<number>) {
      state.logger.exercises[action.payload]?.sets.push(emptySet());
    },
    removeSetRow(
      state,
      action: PayloadAction<{ exerciseIndex: number; setIndex: number }>,
    ) {
      state.logger.exercises[action.payload.exerciseIndex]?.sets.splice(
        action.payload.setIndex,
        1,
      );
    },
    setSetField(
      state,
      action: PayloadAction<{
        exerciseIndex: number;
        setIndex: number;
        field: keyof DraftSet;
        value: string;
      }>,
    ) {
      const { exerciseIndex, setIndex, field, value } = action.payload;
      const set = state.logger.exercises[exerciseIndex]?.sets[setIndex];
      if (set) set[field] = value;
    },
    resetLoggerDraft(state) {
      state.logger = { title: '', performedAt: '', exercises: [emptyExercise()] };
    },
    loadLoggerDraft(
      state,
      action: PayloadAction<{
        title: string;
        performedAt: string;
        exercises: DraftExercise[];
      }>,
    ) {
      state.logger = action.payload;
    },
    setWorkoutFilter(state, action: PayloadAction<Partial<WorkoutFilterDraft>>) {
      state.appliedFilter = { ...state.appliedFilter, ...action.payload };
    },
    clearWorkoutFilters(state) {
      state.appliedFilter = emptyFilter();
    },
  },
});

export const {
  setLoggerTitle,
  setLoggerPerformedAt,
  addExerciseRow,
  removeExerciseRow,
  setExerciseName,
  addSetRow,
  removeSetRow,
  setSetField,
  resetLoggerDraft,
  loadLoggerDraft,
  setWorkoutFilter,
  clearWorkoutFilters,
} = workoutsSlice.actions;

export const workoutsReducer = workoutsSlice.reducer;
