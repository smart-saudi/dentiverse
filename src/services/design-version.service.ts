import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type {
  CreateDesignVersionInput,
  ReviewDesignVersionInput,
  DesignVersionListQuery,
} from '@/lib/validations/design-version';
import { NotFoundError } from '@/lib/errors';

type Client = SupabaseClient<Database>;
type DesignVersionRow = Database['public']['Tables']['design_versions']['Row'];

/**
 * Service for design version operations (submit, review, list).
 */
export class DesignVersionService {
  /**
   * Create a new design version submission.
   *
   * @param client - Supabase client
   * @param caseId - Case ID
   * @param designerId - Designer's user ID
   * @param versionNumber - Sequential version number
   * @param input - Version data (files, notes)
   * @returns The created design version
   */
  async createVersion(
    client: Client,
    caseId: string,
    designerId: string,
    versionNumber: number,
    input: CreateDesignVersionInput,
  ): Promise<DesignVersionRow> {
    const { data, error } = await client
      .from('design_versions')
      .insert({
        case_id: caseId,
        designer_id: designerId,
        version_number: versionNumber,
        file_urls: input.file_urls,
        thumbnail_url: input.thumbnail_url ?? null,
        preview_model_url: input.preview_model_url ?? null,
        notes: input.notes ?? null,
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create design version');
    return data;
  }

  /**
   * Fetch a design version by ID.
   *
   * @param client - Supabase client
   * @param versionId - Design version ID
   * @returns The design version row
   * @throws NotFoundError if not found
   */
  async getVersion(client: Client, versionId: string): Promise<DesignVersionRow> {
    const { data, error } = await client
      .from('design_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error || !data) throw new NotFoundError('Design version not found');
    return data;
  }

  /**
   * List design versions for a case, ordered by version number descending.
   *
   * @param client - Supabase client
   * @param caseId - Case ID
   * @param query - Pagination params
   * @returns Paginated list of design versions
   */
  async listVersionsForCase(
    client: Client,
    caseId: string,
    query: DesignVersionListQuery,
  ): Promise<{
    data: DesignVersionRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    const offset = (query.page - 1) * query.per_page;

    const { data, error, count } = await client
      .from('design_versions')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId)
      .order('version_number', { ascending: false })
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
   * Review a design version (approve or request revision).
   *
   * @param client - Supabase client
   * @param versionId - Design version ID
   * @param input - Review status and optional feedback
   * @returns The updated design version
   */
  async reviewVersion(
    client: Client,
    versionId: string,
    input: ReviewDesignVersionInput,
  ): Promise<DesignVersionRow> {
    const { data, error } = await client
      .from('design_versions')
      .update({
        status: input.status,
        revision_feedback: input.revision_feedback ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', versionId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to review design version');
    return data;
  }

  /**
   * Get the latest design version for a case.
   *
   * @param client - Supabase client
   * @param caseId - Case ID
   * @returns The latest design version or null
   */
  async getLatestVersion(
    client: Client,
    caseId: string,
  ): Promise<DesignVersionRow | null> {
    const { data, error } = await client
      .from('design_versions')
      .select('*')
      .eq('case_id', caseId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  }
}
