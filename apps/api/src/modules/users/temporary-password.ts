import { randomBytes } from 'node:crypto';

const ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

/** Cryptographically random temporary password. Never log the return value. */
export function generateTemporaryPassword(length = 16): string {
  const bytes = randomBytes(length);
  let password = '';
  for (const byte of bytes) {
    password += ALPHABET[byte % ALPHABET.length];
  }
  return password;
}
