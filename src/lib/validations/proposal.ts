import { z } from 'zod';

export const PROPOSAL_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
] as const;

/**
 * Schema for creating a proposal on a case.
 */
export const createProposalSchema = z.object({
  price: z.number().min(0.01),
  estimated_hours: z.number().min(1),
  message: z.string().trim().min(1).max(2000),
});

/**
 * Schema for listing proposals with optional filters.
 */
export const proposalListQuerySchema = z.object({
  status: z.enum(PROPOSAL_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type ProposalListQuery = z.infer<typeof proposalListQuerySchema>;
