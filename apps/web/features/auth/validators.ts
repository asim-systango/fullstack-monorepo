import { z } from '@shared/api-client';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number cannot exceed 20 digits')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(
        /[@$!%*?&#^()_-]/,
        'Password must contain at least one special character (@$!%*?&#^()_-)',
      ),
    role: z.enum(['PATIENT', 'DOCTOR']).optional(),
    specialization: z.string().optional().or(z.literal('')),
    qualification: z.string().optional().or(z.literal('')),
    experienceYears: z.coerce
      .number()
      .min(0, 'Experience must be 0 or positive')
      .optional(),
    consultationFee: z.coerce.number().min(0, 'Fee must be 0 or positive').optional(),
    biography: z.string().optional().or(z.literal('')),
    profileImage: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(
    (data: { password?: string; confirmPassword?: string }) =>
      data.password === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  );

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
