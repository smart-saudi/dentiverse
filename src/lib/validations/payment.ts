import { z } from 'zod';

export const PAYMENT_STATUSES = [
  'PENDING',
  'HELD',
  'RELEASED',
  'REFUNDED',
] as const;

/**
 * Schema for creating a payment (hold in escrow).
 */
export const createPaymentSchema = z.object({
  case_id: z.string().min(1),
  designer_id: z.string().min(1),
  amount: z.number().min(0.01),
  currency: z.string().min(3).max(3).default('USD'),
});

/**
 * Schema for listing payments with optional filters.
 */
export const paymentListQuerySchema = z.object({
  status: z.enum(PAYMENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
