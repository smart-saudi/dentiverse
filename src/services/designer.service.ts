import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type {
  CreateDesignerProfileInput,
  UpdateDesignerProfileInput,
  DesignerSearchQuery,
} from '@/lib/validations/designer';
import { NotFoundError } from '@/lib/errors';

type Client = SupabaseClient<Database>;
type DesignerProfileRow = Database['public']['Tables']['designer_profiles']['Row'];

/**
 * Service for designer profile operations.
 */
export class DesignerService {
  /**
   * Fetch a designer profile by its ID.
   *
   * @param client - Supabase client
   * @param designerId - Designer profile ID
   * @returns The designer profile row
   * @throws NotFoundError if profile does not exist
   */
  async getProfile(client: Client, designerId: string): Promise<DesignerProfileRow> {
    const { data, error } = await client
      .from('designer_profiles')
      .select('*')
      .eq('id', designerId)
      .single();

    if (error || !data) throw new NotFoundError('Designer profile not found');
    return data;
  }

  /**
   * Fetch a designer profile by user ID.
   *
   * @param client - Supabase client
   * @param userId - User ID
   * @returns The designer profile row
   * @throws NotFoundError if profile does not exist
   */
  async getProfileByUserId(client: Client, userId: string): Promise<DesignerProfileRow> {
    const { data, error } = await client
      .from('designer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) throw new NotFoundError('Designer profile not found');
    return data;
  }

  /**
   * Create a new designer profile.
   *
   * @param client - Supabase client
   * @param userId - User ID to associate profile with
   * @param input - Profile creation data
   * @returns The created designer profile
   */
  async createProfile(
    client: Client,
    userId: string,
    input: CreateDesignerProfileInput,
  ): Promise<DesignerProfileRow> {
    const { data, error } = await client
      .from('designer_profiles')
      .insert({
        user_id: userId,
        bio: input.bio ?? null,
        software_skills: input.software_skills,
        specializations: input.specializations,
        years_experience: input.years_experience,
        hourly_rate: input.hourly_rate ?? null,
        portfolio_urls: input.portfolio_urls ?? [],
        languages: input.languages ?? [],
        certifications: input.certifications ?? [],
        is_available: input.is_available,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create profile');
    return data;
  }

  /**
   * Update a designer profile by user ID.
   *
   * @param client - Supabase client
   * @param userId - User ID of the profile owner
   * @param input - Partial update data
   * @returns The updated designer profile
   */
  async updateProfile(
    client: Client,
    userId: string,
    input: UpdateDesignerProfileInput,
  ): Promise<DesignerProfileRow> {
    const { data, error } = await client
      .from('designer_profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to update profile');
    return data;
  }

  /**
   * List designers with search, filters, and pagination.
   *
   * @param client - Supabase client
   * @param query - Search and filter parameters
   * @returns Paginated list of designer profiles
   */
  async listDesigners(
    client: Client,
    query: DesignerSearchQuery,
  ): Promise<{
    data: DesignerProfileRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    let q = client
      .from('designer_profiles')
      .select('*', { count: 'exact' })
      .eq('is_available', query.is_available ?? true);

    if (query.specialization) {
      q = q.contains('specializations', [query.specialization]);
    }
    if (query.software) {
      q = q.contains('software_skills', [query.software]);
    }
    if (query.min_rating !== undefined) {
      q = q.gte('avg_rating', query.min_rating);
    }
    if (query.language) {
      q = q.contains('languages', [query.language]);
    }

    const offset = (query.page - 1) * query.per_page;
    const { data, error, count } = await q
      .order(query.sort_by, { ascending: query.sort_by === 'hourly_rate' })
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
}
