/** Shared client-side validators for the auth forms (login/register). */

export function isValidEmail(value: string): boolean {
  if (/\s/.test(value)) return false;
  const [local, domain, ...rest] = value.split('@');
  if (!local || !domain || rest.length > 0) return false;
  const dotIndex = domain.indexOf('.');
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

export function getEmailError(value: string): string | null {
  if (!value.trim()) return 'Email is required';
  if (!isValidEmail(value)) return 'Enter a valid email address';
  return null;
}

export function getRequiredError(value: string, label: string): string | null {
  return value.trim() ? null : `${label} is required`;
}

export function getPasswordError(value: string, minLength: number): string | null {
  if (!value) return 'Password is required';
  if (value.length < minLength)
    return `Password must be at least ${minLength} characters`;
  return null;
}
