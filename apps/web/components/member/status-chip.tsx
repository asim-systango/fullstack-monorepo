import type { LoanDueTone } from '@/lib/member';
import type { ReactNode } from 'react';

const CHIP_CLASS: Record<
  LoanDueTone | 'neutral' | 'available' | 'unpaid' | 'paid' | 'waived' | 'rejected',
  string
> = {
  healthy: 'member-chip-healthy',
  dueSoon: 'member-chip-dueSoon',
  overdue: 'member-chip-overdue',
  unpaid: 'member-chip-unpaid',
  paid: 'member-chip-paid',
  waived: 'member-chip-waived',
  rejected: 'member-chip-rejected',
  neutral: 'member-chip-neutral',
  available: 'member-chip-available',
};

export function StatusChip({
  tone,
  children,
}: Readonly<{
  tone: LoanDueTone | 'neutral' | 'available' | 'unpaid' | 'paid' | 'waived' | 'rejected';
  children: ReactNode;
}>) {
  return <span className={`member-chip ${CHIP_CLASS[tone]}`}>{children}</span>;
}
