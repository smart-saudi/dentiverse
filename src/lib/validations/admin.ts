import { z } from 'zod';

import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const pageSchema = z.coerce.number().int().min(1).default(1);
const perPageSchema = z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE);

export const AdminUserAction = {
  SUSPEND: 'SUSPEND',
  REACTIVATE: 'REACTIVATE',
} as const;
export type AdminUserAction = (typeof AdminUserAction)[keyof typeof AdminUserAction];

export const AdminCaseTargetStatus = {
  DISPUTED: 'DISPUTED',
  REVIEW: 'REVIEW',
  REVISION: 'REVISION',
  CANCELLED: 'CANCELLED',
} as const;
export type AdminCaseTargetStatus =
  (typeof AdminCaseTargetStatus)[keyof typeof AdminCaseTargetStatus];

export const AdminPaymentAction = {
  MARK_DISPUTED: 'MARK_DISPUTED',
  RELEASE: 'RELEASE',
  REFUND: 'REFUND',
} as const;
export type AdminPaymentAction =
  (typeof AdminPaymentAction)[keyof typeof AdminPaymentAction];

const adminActionAuditSchema = z.object({
  ticket_reference: z
    .string()
    .trim()
    .min(3, 'Ticket reference is required')
    .max(64, 'Ticket reference must be 64 characters or fewer'),
  reason: z
    .string()
    .trim()
    .min(12, 'Reason must be at least 12 characters')
    .max(500, 'Reason must be 500 characters or fewer'),
});

const booleanQuerySchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => (typeof value === 'boolean' ? value : value === 'true'));

/**
 * Query schema for admin user listing.
 */
export const adminUserListQuerySchema = z.object({
  page: pageSchema,
  per_page: perPageSchema,
  q: z.string().trim().min(1).max(100).optional(),
  role: z.enum(['DENTIST', 'LAB', 'DESIGNER', 'ADMIN']).optional(),
  is_active: booleanQuerySchema.optional(),
});

/**
 * Body schema for admin user actions.
 */
export const adminUserActionSchema = adminActionAuditSchema.extend({
  action: z.enum([AdminUserAction.SUSPEND, AdminUserAction.REACTIVATE]),
});

/**
 * Query schema for admin case listing.
 */
export const adminCaseListQuerySchema = z.object({
  page: pageSchema,
  per_page: perPageSchema,
  q: z.string().trim().min(1).max(100).optional(),
  status: z
    .enum([
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
    ])
    .optional(),
});

/**
 * Body schema for admin case support actions.
 */
export const adminCaseActionSchema = adminActionAuditSchema.extend({
  target_status: z.enum([
    AdminCaseTargetStatus.DISPUTED,
    AdminCaseTargetStatus.REVIEW,
    AdminCaseTargetStatus.REVISION,
    AdminCaseTargetStatus.CANCELLED,
  ]),
});

/**
 * Query schema for admin payment listing.
 */
export const adminPaymentListQuerySchema = z.object({
  page: pageSchema,
  per_page: perPageSchema,
  status: z.enum(['PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED']).optional(),
});

/**
 * Body schema for admin payment support actions.
 */
export const adminPaymentActionSchema = adminActionAuditSchema.extend({
  action: z.enum([
    AdminPaymentAction.MARK_DISPUTED,
    AdminPaymentAction.RELEASE,
    AdminPaymentAction.REFUND,
  ]),
});

/**
 * Query schema for admin audit-log listing.
 */
export const adminAuditLogQuerySchema = z.object({
  page: pageSchema,
  per_page: perPageSchema,
  q: z.string().trim().min(1).max(100).optional(),
  entity_type: z.string().trim().min(1).max(100).optional(),
  action: z.string().trim().min(1).max(150).optional(),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserActionInput = z.infer<typeof adminUserActionSchema>;
export type AdminCaseListQuery = z.infer<typeof adminCaseListQuerySchema>;
export type AdminCaseActionInput = z.infer<typeof adminCaseActionSchema>;
export type AdminPaymentListQuery = z.infer<typeof adminPaymentListQuerySchema>;
export type AdminPaymentActionInput = z.infer<typeof adminPaymentActionSchema>;
export type AdminAuditLogQuery = z.infer<typeof adminAuditLogQuerySchema>;
