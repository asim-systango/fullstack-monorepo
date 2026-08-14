import { z } from 'zod';
import { settingValueTypeSchema } from './enums';

export const appSettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.string(),
  valueType: settingValueTypeSchema,
  description: z.string().nullable(),
  updatedBy: z.string().uuid().nullable(),
  updatedAt: z.string(),
});
export type AppSetting = z.infer<typeof appSettingSchema>;

export const updateSettingInputSchema = z.object({
  value: z.string().min(1).max(100),
});
export type UpdateSettingInput = z.infer<typeof updateSettingInputSchema>;
