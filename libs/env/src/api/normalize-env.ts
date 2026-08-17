/** Map Decentra-style env names (and legacy Splitter names) to canonical API env keys. */
export function normalizeApiEnv(
  env: Record<string, string | undefined>,
): Record<string, string | undefined> {
  const e = { ...env };

  if (!e.JWT_SECRET && e.AUTH_JWT_SECRET) e.JWT_SECRET = e.AUTH_JWT_SECRET;
  if (!e.JWT_EXPIRES_IN && e.AUTH_JWT_TOKEN_EXPIRES_IN) {
    e.JWT_EXPIRES_IN = e.AUTH_JWT_TOKEN_EXPIRES_IN;
  }

  if (!e.DATABASE_URL && e.DATABASE_HOST) {
    const user = e.DATABASE_USERNAME ?? 'postgres';
    const pass = encodeURIComponent(e.DATABASE_PASSWORD ?? '');
    const host = e.DATABASE_HOST;
    const port = e.DATABASE_PORT ?? '5432';
    const db = e.DATABASE_NAME ?? 'postgres';
    e.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
  }

  if (!e.SMTP_HOST && e.MAIL_HOST) e.SMTP_HOST = e.MAIL_HOST;
  if (!e.SMTP_PORT && e.MAIL_PORT) e.SMTP_PORT = e.MAIL_PORT;
  if (!e.SMTP_USER && e.MAIL_USER) e.SMTP_USER = e.MAIL_USER;
  if (!e.SMTP_PASS && e.MAIL_PASSWORD) e.SMTP_PASS = e.MAIL_PASSWORD;
  if (!e.SMTP_SECURE && e.MAIL_SECURE != null) e.SMTP_SECURE = e.MAIL_SECURE;
  if (!e.SMTP_REQUIRE_TLS && e.MAIL_REQUIRE_TLS != null) {
    e.SMTP_REQUIRE_TLS = e.MAIL_REQUIRE_TLS;
  }

  if (!e.SMTP_FROM && e.MAIL_DEFAULT_EMAIL) {
    const name = e.MAIL_DEFAULT_NAME?.trim() || 'Api';
    e.SMTP_FROM = `${name} <${e.MAIL_DEFAULT_EMAIL}>`;
  }

  if (!e.EMAIL_VERIFICATION_EXPIRES_IN && e.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN) {
    e.EMAIL_VERIFICATION_EXPIRES_IN = e.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN;
  }
  if (!e.EMAIL_VERIFICATION_EXPIRES_IN && e.EMAIL_VERIFICATION_EXPIRES_HOURS) {
    e.EMAIL_VERIFICATION_EXPIRES_IN = `${e.EMAIL_VERIFICATION_EXPIRES_HOURS}h`;
  }

  if (!e.PASSWORD_RESET_EXPIRES_IN && e.AUTH_FORGOT_TOKEN_EXPIRES_IN) {
    e.PASSWORD_RESET_EXPIRES_IN = e.AUTH_FORGOT_TOKEN_EXPIRES_IN;
  }
  if (!e.PASSWORD_RESET_EXPIRES_IN && e.PASSWORD_RESET_EXPIRES_HOURS) {
    e.PASSWORD_RESET_EXPIRES_IN = `${e.PASSWORD_RESET_EXPIRES_HOURS}h`;
  }

  return e;
}
