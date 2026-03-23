import { z } from 'zod';

export const NOTIFICATION_TYPES = [
  'NEW_PROPOSAL',
  'DESIGN_SUBMITTED',
  'REVISION_REQUESTED',
  'PAYMENT_RELEASED',
  'NEW_MESSAGE',
  'CASE_ASSIGNED',
  'CASE_COMPLETED',
  'REVIEW_RECEIVED',
] as const;

/**
 * Schema for creating a notification (server-side only).
 */
export const createNotificationSchema = z.object({
  user_id: z.string().min(1),
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(1000).nullable().default(null),
  case_id: z.string().nullable().default(null),
  action_url: z.string().url().nullable().default(null),
});

/**
 * Schema for listing notifications.
 */
export const notificationListQuerySchema = z.object({
  is_read: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
