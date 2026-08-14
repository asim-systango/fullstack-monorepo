/** Known app_setting keys used by domain services. */
export const SettingKeys = {
  MaxActiveLoans: 'max_active_loans',
  FineCentsPerDay: 'fine_cents_per_day',
  DefaultLoanDays: 'default_loan_days',
} as const;

export type SettingKey = (typeof SettingKeys)[keyof typeof SettingKeys];

export const SETTING_DEFAULTS: Record<
  SettingKey,
  { value: string; description: string }
> = {
  [SettingKeys.MaxActiveLoans]: {
    value: '5',
    description: 'Maximum active loans per member',
  },
  [SettingKeys.FineCentsPerDay]: {
    value: '50',
    description: 'Overdue fine in cents per calendar day',
  },
  [SettingKeys.DefaultLoanDays]: {
    value: '14',
    description: 'Default loan period in days when dueDate is omitted',
  },
};
