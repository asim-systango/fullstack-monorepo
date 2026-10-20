import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { OrderStatus } from '@/lib/types/food-delivery';

type FiltersState = {
  restaurantCuisineDraft: string;
  restaurantSearchDraft: string;
  restaurantCuisineApplied: string;
  restaurantSearchApplied: string;
  orderStatusDraft: OrderStatus | '';
  orderStatusApplied: OrderStatus | '';
};

const initialState: FiltersState = {
  restaurantCuisineDraft: '',
  restaurantSearchDraft: '',
  restaurantCuisineApplied: '',
  restaurantSearchApplied: '',
  orderStatusDraft: '',
  orderStatusApplied: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setRestaurantCuisineDraft(state, action: PayloadAction<string>) {
      state.restaurantCuisineDraft = action.payload;
    },
    setRestaurantSearchDraft(state, action: PayloadAction<string>) {
      state.restaurantSearchDraft = action.payload;
    },
    applyRestaurantFilters(state) {
      state.restaurantCuisineApplied = state.restaurantCuisineDraft.trim();
      state.restaurantSearchApplied = state.restaurantSearchDraft.trim();
    },
    clearRestaurantFilters(state) {
      state.restaurantCuisineDraft = '';
      state.restaurantSearchDraft = '';
      state.restaurantCuisineApplied = '';
      state.restaurantSearchApplied = '';
    },
    setOrderStatusDraft(state, action: PayloadAction<OrderStatus | ''>) {
      state.orderStatusDraft = action.payload;
    },
    applyOrderStatusFilter(state) {
      state.orderStatusApplied = state.orderStatusDraft;
    },
    clearOrderStatusFilter(state) {
      state.orderStatusDraft = '';
      state.orderStatusApplied = '';
    },
  },
});

export const {
  setRestaurantCuisineDraft,
  setRestaurantSearchDraft,
  applyRestaurantFilters,
  clearRestaurantFilters,
  setOrderStatusDraft,
  applyOrderStatusFilter,
  clearOrderStatusFilter,
} = filtersSlice.actions;

export const store = configureStore({
  reducer: {
    filters: filtersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
