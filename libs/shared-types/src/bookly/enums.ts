import { z } from 'zod';

export const bookCopyStatusSchema = z.enum(['available', 'on_loan', 'lost']);
export type BookCopyStatus = z.infer<typeof bookCopyStatusSchema>;

export const reservationStatusSchema = z.enum(['active', 'fulfilled', 'cancelled']);
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

export const checkoutRequestStatusSchema = z.enum([
  'pending',
  'fulfilled',
  'cancelled',
  'rejected',
]);
export type CheckoutRequestStatus = z.infer<typeof checkoutRequestStatusSchema>;

export const fineStatusSchema = z.enum(['unpaid', 'paid', 'waived']);
export type FineStatus = z.infer<typeof fineStatusSchema>;

export const memberStatusSchema = z.enum(['active', 'suspended']);
export type MemberStatus = z.infer<typeof memberStatusSchema>;

export const loanFilterStatusSchema = z.enum(['active', 'returned', 'overdue']);
export type LoanFilterStatus = z.infer<typeof loanFilterStatusSchema>;

export const bookSortSchema = z.enum([
  'title',
  'author',
  'publishedYear',
  'createdAt',
  '-title',
  '-author',
  '-publishedYear',
  '-createdAt',
]);
export type BookSort = z.infer<typeof bookSortSchema>;

export const settingValueTypeSchema = z.enum(['integer', 'decimal', 'boolean', 'string']);
export type SettingValueType = z.infer<typeof settingValueTypeSchema>;

export const settingKeySchema = z.enum([
  'max_active_loans',
  'fine_cents_per_day',
  'default_loan_days',
]);
export type SettingKey = z.infer<typeof settingKeySchema>;
