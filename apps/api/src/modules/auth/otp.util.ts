import { randomInt } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import type { OtpPurpose, User } from '../users/user.entity';

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_COOLDOWN_MS = 60 * 1000;
export const OTP_BCRYPT_ROUNDS = 10;

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
}

export async function verifyOtpHash(
  otp: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(otp, hash);
}

/** Apply a freshly issued OTP onto the user entity (overwrites previous). */
export async function applyIssuedOtp(
  user: User,
  purpose: OtpPurpose,
): Promise<{ user: User; otp: string }> {
  const otp = generateOtpCode();
  user.otpHash = await hashOtp(otp);
  user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  user.otpSentAt = new Date();
  user.otpPurpose = purpose;
  return { user, otp };
}

export function clearOtpFields(user: User): void {
  user.otpHash = null;
  user.otpExpiresAt = null;
  user.otpAttempts = 0;
  user.otpSentAt = null;
  user.otpPurpose = null;
}

export function isOtpCooldownActive(user: User): boolean {
  if (!user.otpSentAt) return false;
  return Date.now() - user.otpSentAt.getTime() < OTP_COOLDOWN_MS;
}
