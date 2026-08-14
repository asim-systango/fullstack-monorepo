import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function invalidateBookQueries(queryClient: QueryClient, bookId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
  if (bookId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(bookId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.bookCopies.list(bookId) });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.public });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.librarian });
}

export function invalidateLoanQueries(
  queryClient: QueryClient,
  opts?: { bookId?: string; loanId?: string },
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
  if (opts?.loanId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.loans.detail(opts.loanId) });
  }
  if (opts?.bookId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(opts.bookId) });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.bookCopies.list(opts.bookId),
    });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

export function invalidateAfterCheckout(
  queryClient: QueryClient,
  opts: { bookId: string },
) {
  invalidateLoanQueries(queryClient, { bookId: opts.bookId });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.member });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.librarian });
}

export function invalidateAfterReturn(
  queryClient: QueryClient,
  opts: { bookId: string; loanId: string },
) {
  invalidateLoanQueries(queryClient, opts);
  void queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.fines.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
}

export function invalidateReservationQueries(
  queryClient: QueryClient,
  opts?: { bookId?: string },
) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
  if (opts?.bookId) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.reservations.byBook(opts.bookId),
    });
    void queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(opts.bookId) });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.member });
}

export function invalidateFineQueries(queryClient: QueryClient, fineId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.fines.all });
  if (fineId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.fines.detail(fineId) });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.member });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
}

export function invalidateMemberQueries(queryClient: QueryClient, userId?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
  if (userId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(userId) });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.members.loanSummary(userId),
    });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
}

export function invalidateSettingsQueries(queryClient: QueryClient, key?: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
  if (key) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.settings.detail(key) });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
}
