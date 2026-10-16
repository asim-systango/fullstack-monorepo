import { z } from 'zod';

export const PASSWORD_HINT = 'At least 8 characters';

const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email');

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

const nameField = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(120, 'Name must be at most 120 characters');

const otpField = z.string().trim().length(6, 'Enter the 6-digit code');

const confirmMatches =
  (passwordKey: 'password' | 'newPassword', confirmKey: 'confirmPassword') =>
  (data: Record<string, string>, ctx: z.RefinementCtx) => {
    if (data[passwordKey] !== data[confirmKey]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: [confirmKey],
      });
    }
  };

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(128),
});

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .superRefine(confirmMatches('password', 'confirmPassword'));

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    email: emailField,
    otp: otpField,
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .superRefine(confirmMatches('newPassword', 'confirmPassword'));

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .superRefine(confirmMatches('newPassword', 'confirmPassword'));

export const verifyOtpSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const profileSchema = z.object({
  name: nameField,
  email: emailField,
});

export const createMemberSchema = z.object({
  name: nameField,
  email: emailField,
});

export const createUserSchema = createMemberSchema;

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'staff', 'user']),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RegisterRequest = Omit<RegisterFormValues, 'confirmPassword'>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordRequest = Omit<ResetPasswordFormValues, 'confirmPassword'>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ChangePasswordRequest = Omit<ChangePasswordFormValues, 'confirmPassword'>;
export type VerifyOtpRequest = z.infer<typeof verifyOtpSchema>;
export type CreateMemberRequest = z.infer<typeof createMemberSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateRoleRequest = z.infer<typeof updateRoleSchema>;

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
