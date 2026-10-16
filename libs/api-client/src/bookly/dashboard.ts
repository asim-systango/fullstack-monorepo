import type { AxiosInstance } from 'axios';
import {
  adminDashboardSchema,
  librarianDashboardSchema,
  memberDashboardSchema,
  publicDashboardSchema,
  type AdminDashboard,
  type LibrarianDashboard,
  type MemberDashboard,
  type PublicDashboard,
} from '@shared/types';
import { unwrapData } from '../unwrap';

export function createDashboardApi(client: AxiosInstance) {
  return {
    async publicStats(): Promise<PublicDashboard> {
      const { data } = await client.get('/dashboard/public');
      return publicDashboardSchema.parse(unwrapData(data));
    },

    async member(): Promise<MemberDashboard> {
      const { data } = await client.get('/dashboard/member');
      return memberDashboardSchema.parse(unwrapData(data));
    },

    async librarian(): Promise<LibrarianDashboard> {
      const { data } = await client.get('/dashboard/librarian');
      return librarianDashboardSchema.parse(unwrapData(data));
    },

    async admin(): Promise<AdminDashboard> {
      const { data } = await client.get('/dashboard/admin');
      return adminDashboardSchema.parse(unwrapData(data));
    },
  };
}
