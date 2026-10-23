import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { loadApiEnv } from '../../common/env';

export type GatewayPublicUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'staff';
};

/**
 * Resolves gateway users over HTTP — domain never queries the `users` table at runtime.
 */
@Injectable()
export class GatewayUsersClient {
  private readonly baseUrl = loadApiEnv().GATEWAY_INTERNAL_URL.replace(/\/$/, '');

  async findByEmail(email: string, authorization?: string): Promise<GatewayPublicUser> {
    const url = `${this.baseUrl}/users/by-email?email=${encodeURIComponent(email.trim().toLowerCase())}`;
    return this.fetchUser(url, authorization, 'No user found with that email');
  }

  async findById(id: string, authorization?: string): Promise<GatewayPublicUser> {
    const url = `${this.baseUrl}/users/${id}`;
    return this.fetchUser(url, authorization, 'User not found');
  }

  private async fetchUser(
    url: string,
    authorization: string | undefined,
    notFoundMessage: string,
  ): Promise<GatewayPublicUser> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(authorization ? { Authorization: authorization } : {}),
        },
      });
    } catch {
      throw new ServiceUnavailableException('Gateway user lookup unavailable');
    }

    if (response.status === 404) {
      throw new NotFoundException(notFoundMessage);
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Gateway user lookup failed (${response.status})`,
      );
    }

    return (await response.json()) as GatewayPublicUser;
  }
}
