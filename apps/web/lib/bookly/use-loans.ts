'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CheckoutLoanInput, ListLoansParams, LookupLoanParams } from '@shared/types';
import { useAuth } from '@/components/auth';
import { loansApi } from '@/lib/api';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import { INSUFFICIENT_PERMISSIONS } from '@/lib/bookly/constants';
import { invalidateAfterCheckout, invalidateAfterReturn } from '@/lib/bookly/invalidate';
import { queryKeys } from '@/lib/query-keys';
import { useLibraryStore } from '@/lib/store';

export function useLoans(params?: ListLoansParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.loans.list(params),
    queryFn: () => loansApi.list(params),
    enabled,
  });
}

export function useLoan(id: string | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES) && Boolean(id);
  return useQuery({
    queryKey: queryKeys.loans.detail(id ?? ''),
    queryFn: () => loansApi.getById(id!),
    enabled,
  });
}

function calendarDaysLate(dueDate: string): number {
  const due = new Date(`${dueDate.slice(0, 10)}T00:00:00Z`);
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const dueUtc = due.getTime();
  return Math.max(0, Math.floor((todayUtc - dueUtc) / 86_400_000));
}

export function useOverdueLoans(params?: ListLoansParams) {
  const { user } = useAuth();
  const enabled = hasRole(user, LIBRARIAN_ROLES);
  return useQuery({
    queryKey: queryKeys.loans.overdue(params),
    queryFn: async () => {
      // Prefer /loans?status=overdue — /loans/overdue currently 500s on the API
      // (databaseName TypeORM bug). Keep the same OverdueLoan shape for the UI.
      const page = await loansApi.list({ ...params, status: 'overdue' });
      return {
        ...page,
        items: page.items.map((loan) => ({
          ...loan,
          daysLate: calendarDaysLate(loan.dueDate),
          fineAmountCents: loan.fine?.amountCents ?? null,
          fineStatus: loan.fine?.status ?? null,
        })),
      };
    },
    enabled,
  });
}

export function useLoanLookup(params: LookupLoanParams | undefined) {
  const { user } = useAuth();
  const enabled = hasRole(user, [ROLES.staff]) && Boolean(params);
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
  const resetCheckoutWorkflow = useLibraryStore((s) => s.resetCheckoutWorkflow);
  const canCheckout = hasRole(user, [ROLES.staff]);

  return useMutation({
    mutationFn: (input: CheckoutLoanInput) => {
      if (!canCheckout) throw new Error(INSUFFICIENT_PERMISSIONS);
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
  const canReturn = hasRole(user, [ROLES.staff]);

  return useMutation({
    mutationFn: (id: string) => {
      if (!canReturn) throw new Error(INSUFFICIENT_PERMISSIONS);
      return loansApi.returnLoan(id);
    },
    onSuccess: (loan) => {
      invalidateAfterReturn(queryClient, { bookId: loan.bookId, loanId: loan.id });
    },
  });
}
