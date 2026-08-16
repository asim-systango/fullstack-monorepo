import type { AxiosInstance } from 'axios';
import { userSchema, type User } from '@shared/types';
import { unwrapData } from '../unwrap';

export function createUsersApi(client: AxiosInstance) {
  return {
    async create(input: { name: string; email: string }): Promise<User> {
      const { data } = await client.post('/users', input);
      return userSchema.parse(unwrapData(data));
    },

    async updateRole(id: string, input: { role: User['role'] }): Promise<User> {
      const { data } = await client.patch(`/users/${id}/role`, input);
      return userSchema.parse(unwrapData(data));
    },
  };
}
