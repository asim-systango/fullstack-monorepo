import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CheckoutSelectionState = {
  memberId: string | null;
  bookId: string | null;
  copyId: string | null;
};

const initialState: CheckoutSelectionState = {
  memberId: null,
  bookId: null,
  copyId: null,
};

const checkoutSelectionSlice = createSlice({
  name: 'checkoutSelection',
  initialState,
  reducers: {
    setMemberId(state, action: PayloadAction<string | null>) {
      state.memberId = action.payload;
    },
    setBookId(state, action: PayloadAction<string | null>) {
      state.bookId = action.payload;
      state.copyId = null;
    },
    setCopyId(state, action: PayloadAction<string | null>) {
      state.copyId = action.payload;
    },
    resetCheckoutWorkflow() {
      return initialState;
    },
  },
});

export const {
  setMemberId,
  setBookId,
  setCopyId,
  resetCheckoutWorkflow,
} = checkoutSelectionSlice.actions;

export const checkoutSelectionReducer = checkoutSelectionSlice.reducer;
