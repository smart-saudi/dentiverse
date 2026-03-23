import { z } from 'zod';

import { CASE_TYPES } from '@/lib/validations/case';

/**
 * Schema for creating a designer profile (onboarding).
 */
export const createDesignerProfileSchema = z.object({
  bio: z.string().trim().min(1).max(2000).optional(),
  software_skills: z.array(z.string().trim().min(1)).min(1),
  specializations: z.array(z.enum(CASE_TYPES)).min(1),
  years_experience: z.number().int().min(0),
  hourly_rate: z.number().min(0).optional(),
  portfolio_urls: z.array(z.string().url()).optional(),
  languages: z.array(z.string().min(1).max(5)).optional(),
  certifications: z.array(z.string().trim().min(1)).optional(),
  is_available: z.boolean().default(true),
});

/**
 * Schema for updating a designer profile.
 */
export const updateDesignerProfileSchema = z.object({
  bio: z.string().trim().min(1).max(2000).optional(),
  software_skills: z.array(z.string().trim().min(1)).min(1).optional(),
  specializations: z.array(z.enum(CASE_TYPES)).min(1).optional(),
  years_experience: z.number().int().min(0).optional(),
  hourly_rate: z.number().min(0).optional(),
  portfolio_urls: z.array(z.string().url()).optional(),
  languages: z.array(z.string().min(1).max(5)).optional(),
  certifications: z.array(z.string().trim().min(1)).optional(),
  is_available: z.boolean().optional(),
});

/**
 * Schema for designer search/browse query parameters.
 */
export const designerSearchQuerySchema = z.object({
  q: z.string().optional(),
  specialization: z.enum(CASE_TYPES).optional(),
  software: z.string().optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  is_available: z.coerce.boolean().optional(),
  language: z.string().optional(),
  sort_by: z
    .enum(['avg_rating', 'years_experience', 'completed_cases', 'hourly_rate'])
    .default('avg_rating'),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateDesignerProfileInput = z.infer<typeof createDesignerProfileSchema>;
export type UpdateDesignerProfileInput = z.infer<typeof updateDesignerProfileSchema>;
export type DesignerSearchQuery = z.infer<typeof designerSearchQuerySchema>;
