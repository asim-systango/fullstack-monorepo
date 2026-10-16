import { createHash, randomBytes } from 'crypto';

/** Cryptographically random token for email links (raw value never stored). */
export function generateRawToken(): string {
  return randomBytes(32).toString('hex');
}

/** SHA-256 hash of a raw token for storage at rest. */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
