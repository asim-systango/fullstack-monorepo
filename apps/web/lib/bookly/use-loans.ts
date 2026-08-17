'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CheckoutLoanInput,
  ListLoansParams,
  LookupLoanParams,
  ReturnLoanInput,
} from '@shared/types';
import { useAuth } from '@/components/auth';
import { loansApi } from '@/lib/api';
import { canCheckout, canReturn, hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateAfterCheckout, invalidateAfterReturn } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';
import { useCheckoutSelection } from '@/lib/store';

export function useLoans(params?: ListLoansParams, options?: { enabled?: boolean }) {
  const { user } = useAuth();
  const enabled = (options?.enabled ?? true) && hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.loans.list(params),
    queryFn: ({ signal }) => loansApi.list(params, signal),
    enabled,
  });
}

export function useOverdueLoans(params?: ListLoansParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.loans.overdue(params),
    queryFn: ({ signal }) => loansApi.listOverdue(params, signal),
    enabled,
  });
}

export function useLoanLookup(params: LookupLoanParams | undefined) {
  const { user } = useAuth();
  const enabled = canReturn(user) && Boolean(params);
  return useQuery({
    queryKey: params
      ? queryKeys.loans.lookup(params)
      : ([...queryKeys.loans.all, 'lookup', 'idle'] as const),
    queryFn: () => loansApi.lookup(params!),
    enabled,
  });
}

export function useMyLoans(params?: ListLoansParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.user]);
  return useQuery({
    queryKey: queryKeys.loans.mine(params),
    queryFn: () => loansApi.listMine(params),
    enabled,
  });
}

export function useCheckoutLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { resetCheckoutWorkflow } = useCheckoutSelection();
  const allowed = canCheckout(user);

  return useMutation({
    mutationFn: (input: CheckoutLoanInput) => {
      if (!allowed) throw new Error(INSUFFICIENT_PERMISSIONS);
      return loansApi.checkout(input);
    },
    onSuccess: (loan) => {
      invalidateAfterCheckout(queryClient, { bookId: loan.bookId });
      resetCheckoutWorkflow();
    },
  });
}

export function useReturnLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const allowed = canReturn(user);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: ReturnLoanInput }) => {
      if (!allowed) throw new Error(INSUFFICIENT_PERMISSIONS);
      return loansApi.returnLoan(id, input);
    },
    onSuccess: (loan) => {
      invalidateAfterReturn(queryClient, { bookId: loan.bookId, loanId: loan.id });
    },
  });
}

export function useSendOverdueNotice() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canSend = hasRole(user, LIBRARIAN_ROLES);

  return useMutation({
    mutationFn: (id: string) => {
      if (!canSend) throw new Error(INSUFFICIENT_PERMISSIONS);
      return loansApi.sendOverdueNotice(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useSendOverdueNotices() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canSend = hasRole(user, LIBRARIAN_ROLES);

  return useMutation({
    mutationFn: () => {
      if (!canSend) throw new Error(INSUFFICIENT_PERMISSIONS);
      return loansApi.sendOverdueNotices();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}
