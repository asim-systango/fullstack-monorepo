import type { AxiosInstance } from 'axios';
import { userSchema, createUserInputSchema, updateRoleInputSchema, type User } from '@shared/types';
import { unwrapData } from '../unwrap';

export function createUsersApi(client: AxiosInstance) {
  return {
    async create(input: { name: string; email: string }): Promise<User> {
      const body = createUserInputSchema.parse(input);
      const { data } = await client.post('/users', body);
      return userSchema.parse(unwrapData(data));
    },

    async updateRole(id: string, input: { role: User['role'] }): Promise<User> {
      const body = updateRoleInputSchema.parse(input);
      const { data } = await client.patch(`/users/${id}/role`, body);
      return userSchema.parse(unwrapData(data));
    },
  };
}
