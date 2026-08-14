import type { ReactNode } from 'react';

import type { LoanDueTone } from '@/lib/member';

const CHIP_CLASS: Record<LoanDueTone | 'neutral' | 'available' | 'unpaid', string> = {
  healthy: 'member-chip-healthy',
  dueSoon: 'member-chip-dueSoon',
  overdue: 'member-chip-overdue',
  unpaid: 'member-chip-unpaid',
  neutral: 'member-chip-neutral',
  available: 'member-chip-available',
};

export function StatusChip({
  tone,
  children,
}: Readonly<{
  tone: LoanDueTone | 'neutral' | 'available' | 'unpaid';
  children: ReactNode;
}>) {
  return <span className={`member-chip ${CHIP_CLASS[tone]}`}>{children}</span>;
}
