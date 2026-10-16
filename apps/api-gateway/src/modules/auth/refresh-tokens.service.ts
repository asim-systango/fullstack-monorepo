import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly tokens: Repository<RefreshToken>,
  ) {}

  /** Create opaque refresh token; returns plaintext once (store only hash). */
  async issue(userId: string, ttlMs: number): Promise<string> {
    const raw = randomBytes(48).toString('base64url');
    await this.tokens.save(
      this.tokens.create({
        userId,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + ttlMs),
        revokedAt: null,
      }),
    );
    return raw;
  }

  async findValid(raw: string): Promise<RefreshToken | null> {
    const row = await this.tokens.findOne({
      where: { tokenHash: hashToken(raw), revokedAt: IsNull() },
    });
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) return null;
    return row;
  }

  async revoke(raw: string): Promise<void> {
    const row = await this.findValid(raw);
    if (!row) return;
    row.revokedAt = new Date();
    await this.tokens.save(row);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.tokens
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revokedAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }

  /** Rotate: revoke old, issue new. */
  async rotate(oldRaw: string, userId: string, ttlMs: number): Promise<string> {
    await this.revoke(oldRaw);
    return this.issue(userId, ttlMs);
  }
}
