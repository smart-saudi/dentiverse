import { z } from 'zod';

/**
 * Valid FDI tooth number: quadrant (1-4) + tooth (1-8) → range 11-48.
 */
const toothNumberSchema = z
  .number()
  .int()
  .min(11, 'Invalid tooth number (FDI range: 11-48)')
  .max(48, 'Invalid tooth number (FDI range: 11-48)');

/** All possible case types. */
export const CASE_TYPES = [
  'CROWN',
  'BRIDGE',
  'IMPLANT',
  'VENEER',
  'INLAY',
  'ONLAY',
  'DENTURE',
  'OTHER',
] as const;

/** All possible case statuses. */
export const CASE_STATUSES = [
  'DRAFT',
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'REVIEW',
  'REVISION',
  'APPROVED',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
] as const;

/**
 * Schema for creating a new case.
 * Required: case_type, title, tooth_numbers.
 */
export const createCaseSchema = z.object({
  case_type: z.enum(CASE_TYPES),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or fewer'),
  description: z.string().optional(),
  tooth_numbers: z
    .array(toothNumberSchema)
    .min(1, 'At least one tooth number is required'),
  material_preference: z.string().optional(),
  shade: z.string().optional(),
  budget_min: z.number().min(0, 'Budget cannot be negative').optional(),
  budget_max: z.number().min(0, 'Budget cannot be negative').optional(),
  deadline: z.string().datetime().optional(),
  urgency: z.enum(['normal', 'urgent', 'rush']).default('normal'),
  special_instructions: z.string().optional(),
  software_required: z.string().optional(),
  output_format: z.string().default('STL'),
  max_revisions: z.number().int().min(0).default(2),
});

/** Inferred type for case creation input. */
export type CreateCaseInput = z.infer<typeof createCaseSchema>;

/**
 * Schema for updating an existing case (DRAFT or OPEN only).
 * All fields are optional.
 */
export const updateCaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .optional(),
  description: z.string().optional(),
  budget_min: z.number().min(0, 'Budget cannot be negative').optional(),
  budget_max: z.number().min(0, 'Budget cannot be negative').optional(),
  deadline: z.string().datetime().optional(),
  special_instructions: z.string().optional(),
});

/** Inferred type for case update input. */
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;

/**
 * Schema for case list query parameters.
 */
export const caseListQuerySchema = z.object({
  status: z.enum(CASE_STATUSES).optional(),
  case_type: z.enum(CASE_TYPES).optional(),
  sort_by: z
    .enum(['created_at', 'deadline', 'budget_max'])
    .default('created_at'),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

/** Inferred type for case list query. */
export type CaseListQuery = z.infer<typeof caseListQuerySchema>;
