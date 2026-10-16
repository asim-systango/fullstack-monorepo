import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import {
  emptyListFilters,
  resumeToDraft,
  SECTION_TYPE_LABELS,
  type ListFilters,
  type Resume,
  type ResumeDraft,
  type SectionType,
  type TemplateKey,
} from '../resume-types';

/**
 * Ownership rule:
 * - RTK owns unfinished drafts, selection, and filter chrome only.
 * - TanStack Query owns server lists and mutations.
 * Never put Nest entity arrays into this store.
 */

type UiState = {
  filterDraft: ListFilters;
  appliedFilter: ListFilters;
};

const initialUiState: UiState = {
  filterDraft: emptyListFilters(),
  appliedFilter: emptyListFilters(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    setFilterDraft(state, action: PayloadAction<Partial<ListFilters>>) {
      state.filterDraft = { ...state.filterDraft, ...action.payload };
    },
    applyFilter(state) {
      state.appliedFilter = {
        ...state.filterDraft,
        q: state.filterDraft.q.trim(),
      };
    },
    resetFilters(state) {
      state.filterDraft = emptyListFilters();
      state.appliedFilter = emptyListFilters();
    },
  },
});

type ResumeDraftState = {
  draft: ResumeDraft | null;
};

const initialDraftState: ResumeDraftState = { draft: null };

function reindexPositions<T extends { position: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, position: index }));
}

function swapAdjacent<T extends { position: number }>(
  items: T[],
  index: number,
  direction: 'up' | 'down',
): T[] {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const tmp = next[index]!;
  next[index] = next[target]!;
  next[target] = tmp;
  return reindexPositions(next);
}

const resumeDraftSlice = createSlice({
  name: 'resumeDraft',
  initialState: initialDraftState,
  reducers: {
    loadFromServer(state, action: PayloadAction<Resume>) {
      state.draft = resumeToDraft(action.payload);
    },
    clear(state) {
      state.draft = null;
    },
    updateFields(
      state,
      action: PayloadAction<
        Partial<
          Pick<
            ResumeDraft,
            | 'title'
            | 'fullName'
            | 'email'
            | 'phone'
            | 'location'
            | 'summary'
            | 'status'
            | 'slug'
          >
        >
      >,
    ) {
      if (!state.draft) return;
      Object.assign(state.draft, action.payload);
    },
    setTemplate(
      state,
      action: PayloadAction<{
        templateId: string;
        templateKey: TemplateKey;
        templateName: string;
      }>,
    ) {
      if (!state.draft) return;
      state.draft.templateId = action.payload.templateId;
      state.draft.templateKey = action.payload.templateKey;
      state.draft.templateName = action.payload.templateName;
    },
    addSection(state, action: PayloadAction<{ type: SectionType; title?: string }>) {
      if (!state.draft) return;
      const type = action.payload.type;
      state.draft.sections.push({
        id: crypto.randomUUID(),
        type,
        title: action.payload.title ?? SECTION_TYPE_LABELS[type],
        position: state.draft.sections.length,
        items: [],
      });
      state.draft.sections = reindexPositions(state.draft.sections);
    },
    updateSection(
      state,
      action: PayloadAction<{
        sectionId: string;
        patch: Partial<Pick<ResumeDraft['sections'][number], 'title' | 'type'>>;
      }>,
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      if (!section) return;
      Object.assign(section, action.payload.patch);
    },
    removeSection(state, action: PayloadAction<{ sectionId: string }>) {
      if (!state.draft) return;
      state.draft.sections = reindexPositions(
        state.draft.sections.filter((s) => s.id !== action.payload.sectionId),
      );
    },
    moveSection(
      state,
      action: PayloadAction<{ sectionId: string; direction: 'up' | 'down' }>,
    ) {
      if (!state.draft) return;
      const sorted = [...state.draft.sections].sort((a, b) => a.position - b.position);
      const index = sorted.findIndex((s) => s.id === action.payload.sectionId);
      if (index < 0) return;
      state.draft.sections = swapAdjacent(sorted, index, action.payload.direction);
    },
    addItem(state, action: PayloadAction<{ sectionId: string }>) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      if (!section) return;
      section.items.push({
        id: crypto.randomUUID(),
        heading: '',
        subheading: '',
        startDate: '',
        endDate: '',
        description: '',
        position: section.items.length,
      });
      section.items = reindexPositions(section.items);
    },
    updateItem(
      state,
      action: PayloadAction<{
        sectionId: string;
        itemId: string;
        patch: Partial<
          Pick<
            ResumeDraft['sections'][number]['items'][number],
            'heading' | 'subheading' | 'startDate' | 'endDate' | 'description'
          >
        >;
      }>,
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      const item = section?.items.find((i) => i.id === action.payload.itemId);
      if (!item) return;
      Object.assign(item, action.payload.patch);
    },
    removeItem(state, action: PayloadAction<{ sectionId: string; itemId: string }>) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      if (!section) return;
      section.items = reindexPositions(
        section.items.filter((i) => i.id !== action.payload.itemId),
      );
    },
    moveItem(
      state,
      action: PayloadAction<{
        sectionId: string;
        itemId: string;
        direction: 'up' | 'down';
      }>,
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s.id === action.payload.sectionId);
      if (!section) return;
      const sorted = [...section.items].sort((a, b) => a.position - b.position);
      const index = sorted.findIndex((i) => i.id === action.payload.itemId);
      if (index < 0) return;
      section.items = swapAdjacent(sorted, index, action.payload.direction);
    },
  },
});

export const { setFilterDraft, applyFilter, resetFilters } = uiSlice.actions;

export const {
  loadFromServer,
  clear: clearResumeDraft,
  updateFields,
  setTemplate,
  addSection,
  updateSection,
  removeSection,
  moveSection,
  addItem,
  updateItem,
  removeItem,
  moveItem,
} = resumeDraftSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    resumeDraft: resumeDraftSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
