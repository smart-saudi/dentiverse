import { z } from 'zod';

/**
 * Password schema with strength requirements.
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Email schema with trim and lowercase transforms.
 */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address');

/**
 * Schema for user registration.
 * @remarks ADMIN role is not allowed during self-registration.
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(255, 'Full name must be 255 characters or fewer'),
  role: z.enum(['DENTIST', 'LAB', 'DESIGNER'], {
    errorMap: () => ({ message: 'Role must be DENTIST, LAB, or DESIGNER' }),
  }),
});

/** Inferred type for registration input. */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema for user login.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/** Inferred type for login input. */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for forgot-password request.
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** Inferred type for forgot-password input. */
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Schema for password reset.
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

/** Inferred type for reset-password input. */
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
