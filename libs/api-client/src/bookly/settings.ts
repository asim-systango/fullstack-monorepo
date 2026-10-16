import type { AxiosInstance } from 'axios';
import {
  appSettingSchema,
  updateSettingInputSchema,
  type AppSetting,
  type UpdateSettingInput,
} from '@shared/types';
import { unwrapData } from '../unwrap';

export function createSettingsApi(client: AxiosInstance) {
  return {
    async list(): Promise<AppSetting[]> {
      const { data } = await client.get('/settings');
      return appSettingSchema.array().parse(unwrapData(data));
    },

    async getByKey(key: string): Promise<AppSetting> {
      const { data } = await client.get(`/settings/${encodeURIComponent(key)}`);
      return appSettingSchema.parse(unwrapData(data));
    },

    async update(key: string, input: UpdateSettingInput): Promise<AppSetting> {
      const body = updateSettingInputSchema.parse(input);
      const { data } = await client.patch(`/settings/${encodeURIComponent(key)}`, body);
      return appSettingSchema.parse(unwrapData(data));
    },
  };
}
