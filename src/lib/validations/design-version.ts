import { z } from 'zod';

export const DESIGN_VERSION_STATUSES = [
  'SUBMITTED',
  'APPROVED',
  'REVISION_REQUESTED',
] as const;

export const designVersionFileSchema = z.object({
  bucket: z.string().trim().min(1).max(100),
  path: z.string().trim().min(1).max(500),
  name: z.string().trim().min(1).max(255),
  size: z.number().int().nonnegative(),
  type: z.string().trim().min(1).max(255),
});

/**
 * Schema for creating a design version submission.
 */
export const createDesignVersionSchema = z.object({
  files: z.array(designVersionFileSchema).min(1),
  thumbnail_url: z.string().url().optional(),
  preview_model_url: z.string().url().optional(),
  notes: z.string().trim().max(2000).optional(),
});

/**
 * Schema for reviewing a design version (approve or request revision).
 */
export const reviewDesignVersionSchema = z.object({
  status: z.enum(['APPROVED', 'REVISION_REQUESTED']),
  revision_feedback: z.string().trim().max(2000).optional(),
});

/**
 * Schema for listing design versions with pagination.
 */
export const designVersionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateDesignVersionInput = z.infer<typeof createDesignVersionSchema>;
export type ReviewDesignVersionInput = z.infer<typeof reviewDesignVersionSchema>;
export type DesignVersionListQuery = z.infer<typeof designVersionListQuerySchema>;
