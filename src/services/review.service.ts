import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/types';
import type { CreateReviewInput, ReviewListQuery } from '@/lib/validations/review';
import { NotFoundError } from '@/lib/errors';

type Client = AppSupabaseClient;
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

/**
 * Service for review operations (create, list, fetch, respond).
 */
export class ReviewService {
  /**
   * Create a review for a completed case.
   *
   * @param client - Supabase client
   * @param caseId - The case being reviewed
   * @param reviewerId - The user submitting the review
   * @param designerId - The designer being reviewed
   * @param input - Review ratings and comment
   * @returns The created review row
   * @throws Error if the insert fails
   */
  async createReview(
    client: Client,
    caseId: string,
    reviewerId: string,
    designerId: string,
    input: CreateReviewInput,
  ): Promise<ReviewRow> {
    const { data, error } = await client
      .from('reviews')
      .insert({
        case_id: caseId,
        reviewer_id: reviewerId,
        designer_id: designerId,
        overall_rating: input.overall_rating,
        accuracy_rating: input.accuracy_rating,
        speed_rating: input.speed_rating,
        communication_rating: input.communication_rating,
        comment: input.comment ?? null,
        is_public: input.is_public,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create review');
    return data;
  }

  /**
   * List reviews for a specific designer with pagination.
   *
   * @param client - Supabase client
   * @param designerId - Designer user ID
   * @param query - Pagination parameters
   * @returns Paginated list of reviews
   */
  async listReviewsForDesigner(
    client: Client,
    designerId: string,
    query: ReviewListQuery,
  ): Promise<{
    data: ReviewRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    const offset = (query.page - 1) * query.per_page;

    const { data, error, count } = await client
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('designer_id', designerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + query.per_page - 1);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: data ?? [],
      meta: {
        page: query.page,
        per_page: query.per_page,
        total,
        total_pages: Math.ceil(total / query.per_page),
      },
    };
  }

  /**
   * Fetch a single review by ID.
   *
   * @param client - Supabase client
   * @param reviewId - Review ID
   * @returns The review row
   * @throws NotFoundError if the review does not exist
   */
  async getReview(client: Client, reviewId: string): Promise<ReviewRow> {
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error || !data) throw new NotFoundError('Review not found');
    return data;
  }

  /**
   * Add a designer response to a review.
   *
   * @param client - Supabase client
   * @param reviewId - Review ID to respond to
   * @param response - The designer's response text
   * @returns The updated review row
   * @throws Error if the update fails
   */
  async respondToReview(
    client: Client,
    reviewId: string,
    response: string,
  ): Promise<ReviewRow> {
    const { data, error } = await client
      .from('reviews')
      .update({
        designer_response: response,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to respond to review');
    return data;
  }
}
