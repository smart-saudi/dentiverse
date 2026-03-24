import { z } from 'zod';

const ratingField = z.coerce.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  overall_rating: ratingField,
  accuracy_rating: ratingField,
  speed_rating: ratingField,
  communication_rating: ratingField,
  comment: z.string().max(2000).optional(),
  is_public: z.boolean().optional().default(true),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
