import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { INTERNAL_SERVICE_TOKEN_HEADER } from '@shared/env/constants';
import { loadGatewayEnv } from '../../common/env';

const PROVISION_TIMEOUT_MS = 3_000;

type MemberProfileStatus = {
  userId: string;
  email: string;
  fullName: string;
  status: string;
};

function unwrapData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in payload &&
    Object.keys(payload as object).length === 1
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/**
 * Server-side client for apps/api internal routes.
 * One-shot calls with a hard timeout — no automatic retries.
 */
@Injectable()
export class DomainApiClient {
  private readonly logger = new Logger(DomainApiClient.name);
  private readonly env = loadGatewayEnv();

  async provisionMemberProfile(input: {
    userId: string;
    email: string;
    fullName: string;
  }): Promise<MemberProfileStatus> {
    return this.request<MemberProfileStatus>('POST', '/internal/member-profiles', {
      body: {
        userId: input.userId,
        email: input.email,
        fullName: input.fullName,
      },
    });
  }

  async syncMemberProfile(
    userId: string,
    input: { email?: string; fullName?: string },
  ): Promise<MemberProfileStatus> {
    return this.request<MemberProfileStatus>(
      'PATCH',
      `/internal/member-profiles/${userId}`,
      { body: input },
    );
  }

  async getMemberProfile(userId: string): Promise<MemberProfileStatus | null> {
    try {
      return await this.request<MemberProfileStatus>(
        'GET',
        `/internal/member-profiles/${userId}`,
      );
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404) return null;
      throw err;
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options: { body?: unknown } = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROVISION_TIMEOUT_MS);

    try {
      const res = await fetch(`${this.env.API_UPSTREAM_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          [INTERNAL_SERVICE_TOKEN_HEADER]: this.env.INTERNAL_SERVICE_TOKEN,
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const payload: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          payload &&
          typeof payload === 'object' &&
          'message' in payload &&
          (payload as { message: unknown }).message
            ? String((payload as { message: unknown }).message)
            : `Upstream ${method} ${path} failed (${res.status})`;

        if (res.status === 404) {
          const err = new Error(message) as Error & { statusCode: number };
          err.statusCode = 404;
          throw err;
        }

        this.logger.warn(`Domain API ${method} ${path} → ${res.status}: ${message}`);
        throw new ServiceUnavailableException(
          'Service temporarily unavailable. Please try again.',
        );
      }

      return unwrapData<T>(payload);
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      if ((err as { statusCode?: number }).statusCode === 404) throw err;

      const aborted =
        err instanceof Error &&
        (err.name === 'AbortError' || err.message.includes('aborted'));
      this.logger.warn(
        `Domain API ${method} ${path} ${aborted ? 'timed out' : 'failed'}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      throw new ServiceUnavailableException(
        'Service temporarily unavailable. Please try again.',
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
