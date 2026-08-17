import { z } from 'zod';
import { memberDashboardLoanSchema } from './loans';
import { reservationWithBookSchema } from './reservations';

export const publicDashboardSchema = z.object({
  totalTitles: z.number().int().nonnegative(),
  availableCopies: z.number().int().nonnegative(),
});
export type PublicDashboard = z.infer<typeof publicDashboardSchema>;

export const memberDashboardSchema = z.object({
  activeLoans: z.array(memberDashboardLoanSchema),
  reservations: z.array(reservationWithBookSchema),
  outstandingFineTotalCents: z.number().int(),
  maxActiveLoans: z.number().int().positive(),
});
export type MemberDashboard = z.infer<typeof memberDashboardSchema>;

export const librarianDashboardSchema = z.object({
  totalBooks: z.number().int().nonnegative(),
  totalCopies: z.number().int().nonnegative(),
  availableCopies: z.number().int().nonnegative(),
  activeLoans: z.number().int().nonnegative(),
  overdueLoans: z.number().int().nonnegative(),
  memberCount: z.number().int().nonnegative(),
});
export type LibrarianDashboard = z.infer<typeof librarianDashboardSchema>;

export const adminDashboardSchema = z.object({
  memberCount: z.number().int().nonnegative(),
  librarianCount: z.number().int().nonnegative(),
  activeLoans: z.number().int().nonnegative(),
  overdueLoans: z.number().int().nonnegative(),
  maxActiveLoans: z.number().int().positive(),
  totalBooks: z.number().int().nonnegative(),
  totalCopies: z.number().int().nonnegative(),
  availableCopies: z.number().int().nonnegative(),
  pendingCheckoutRequests: z.number().int().nonnegative(),
});
export type AdminDashboard = z.infer<typeof adminDashboardSchema>;
