'use client';

import { useState } from 'react';
import { MEMBER_BORROW_LIMIT_MESSAGE } from '@shared/types';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, ROLES } from '@/lib/auth/roles';
import {
  useBook,
  useBookActions,
} from '@/lib/bookly/use-books';
import { useCancelReservation, useCreateReservation } from '@/lib/bookly/use-reservations';
import { useCreateCheckoutRequest } from '@/lib/bookly/use-checkout-requests';

export function useBookDetailActions(bookId: string) {
  const { user } = useAuth();
  const isMember = hasRole(user, [ROLES.user]);
  const isGuest = !user;
  const bookQuery = useBook(bookId);
  const actionsQuery = useBookActions(bookId);
  const createReservation = useCreateReservation();
  const cancelReservation = useCancelReservation();
  const createCheckoutRequest = useCreateCheckoutRequest();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const actions = actionsQuery.data;
  const pending =
    createReservation.isPending ||
    cancelReservation.isPending ||
    createCheckoutRequest.isPending;
  const actionsLoading = isMember && actionsQuery.isPending;
  const actionsError = isMember && actionsQuery.isError;

  async function onRequestCheckout() {
    if (!bookId) return;
    if (actions?.atBorrowLimit) {
      setMessage({ tone: 'error', text: MEMBER_BORROW_LIMIT_MESSAGE });
      return;
    }
    setMessage(null);
    try {
      await createCheckoutRequest.mutateAsync({ bookId });
      setMessage({
        tone: 'success',
        text: 'Checkout request sent successfully.\n\nA librarian will prepare your copy.\nPlease collect the book from the library once it is issued.',
      });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    }
  }

  async function onReserve() {
    if (!bookId) return;
    setMessage(null);
    try {
      await createReservation.mutateAsync({ bookId });
      setMessage({
        tone: 'success',
        text: 'Reservation placed. Track it under My Reservations.',
      });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    }
  }

  async function onCancel() {
    if (!actions?.ownReservation) return;
    setMessage(null);
    try {
      await cancelReservation.mutateAsync({
        id: actions.ownReservation.id,
        bookId,
      });
      setConfirmCancel(false);
      setMessage({ tone: 'success', text: 'Reservation cancelled.' });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    }
  }

  return {
    isMember,
    isGuest,
    bookQuery,
    actions,
    actionsLoading,
    actionsError,
    actionsErrorMessage: actionsQuery.error,
    message,
    confirmCancel,
    setConfirmCancel,
    pending,
    requesting: createCheckoutRequest.isPending,
    reserving: createReservation.isPending,
    cancelling: cancelReservation.isPending,
    onRequestCheckout,
    onReserve,
    onCancel,
  };
}
