import { z } from 'zod';

/**
 * Schema for updating user profile fields.
 * All fields are optional — only provided fields are updated.
 */
export const userUpdateSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(255, 'Full name must be 255 characters or fewer')
    .optional(),
  phone: z.string().max(20).optional().nullable(),
  country: z.string().max(2, 'Country must be a 2-letter ISO code').optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  timezone: z.string().max(50).optional(),
  preferred_lang: z.string().max(5).optional(),
});

/** Inferred type for user profile update input. */
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
