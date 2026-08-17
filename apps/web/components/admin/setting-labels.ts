const SETTING_LABELS: Record<string, string> = {
  max_active_loans: 'Maximum active loans',
  fine_cents_per_day: 'Fine per day',
  default_loan_days: 'Default loan period',
};

const SETTING_HINTS: Record<string, string> = {
  max_active_loans: 'How many books a member can borrow at once.',
  fine_cents_per_day: 'Overdue fine charged per calendar day (stored in cents).',
  default_loan_days: 'Default loan length in days when due date is omitted.',
};

export function settingLabel(key: string): string {
  return (
    SETTING_LABELS[key] ??
    key.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function settingHint(key: string, description: string | null): string {
  if (description?.trim()) return description;
  return SETTING_HINTS[key] ?? 'Library policy value.';
}

export function isMoneyCentsSetting(key: string): boolean {
  return key === 'fine_cents_per_day';
}
