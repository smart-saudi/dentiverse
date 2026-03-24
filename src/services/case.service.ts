import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/types';
import type {
  CreateCaseInput,
  UpdateCaseInput,
  CaseListQuery,
} from '@/lib/validations/case';

type Client = AppSupabaseClient;
type CaseRow = Database['public']['Tables']['cases']['Row'];

/**
 * Service layer for dental case operations.
 */
export class CaseService {
  /**
   * Create a new case in DRAFT status.
   *
   * @param client   - Supabase server client
   * @param clientId - The authenticated user's ID (case owner)
   * @param input    - Validated case creation data
   * @returns The created case row
   * @throws Error if insert fails
   */
  async createCase(
    client: Client,
    clientId: string,
    input: CreateCaseInput,
  ): Promise<CaseRow> {
    const { data, error } = await client
      .from('cases')
      .insert({
        client_id: clientId,
        status: 'DRAFT',
        case_type: input.case_type,
        title: input.title,
        description: input.description ?? null,
        tooth_numbers: input.tooth_numbers,
        material_preference: input.material_preference ?? null,
        shade: input.shade ?? null,
        budget_min: input.budget_min ?? null,
        budget_max: input.budget_max ?? null,
        deadline: input.deadline ?? null,
        urgency: input.urgency,
        special_instructions: input.special_instructions ?? null,
        software_required: input.software_required ?? null,
        output_format: input.output_format,
        max_revisions: input.max_revisions,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Get a single case by ID.
   *
   * @param client - Supabase server client
   * @param caseId - The case UUID
   * @returns The case row
   * @throws Error if not found
   */
  async getCase(client: Client, caseId: string): Promise<CaseRow> {
    const { data, error } = await client
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Update a case (only allowed in DRAFT/OPEN status — enforced at API layer).
   *
   * @param client - Supabase server client
   * @param caseId - The case UUID
   * @param input  - Partial update fields
   * @returns The updated case row
   * @throws Error if update fails
   */
  async updateCase(
    client: Client,
    caseId: string,
    input: UpdateCaseInput,
  ): Promise<CaseRow> {
    const { data, error } = await client
      .from('cases')
      .update(input)
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Publish a draft case (DRAFT → OPEN).
   *
   * @param client - Supabase server client
   * @param caseId - The case UUID
   * @returns The updated case row
   * @throws Error if transition fails
   */
  async publishCase(client: Client, caseId: string): Promise<CaseRow> {
    const { data, error } = await client
      .from('cases')
      .update({ status: 'OPEN' })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Cancel a case.
   *
   * @param client - Supabase server client
   * @param caseId - The case UUID
   * @param reason - Optional cancellation reason
   * @returns The updated case row
   * @throws Error if cancellation fails
   */
  async cancelCase(client: Client, caseId: string, reason?: string): Promise<CaseRow> {
    const { data, error } = await client
      .from('cases')
      .update({
        status: 'CANCELLED',
        cancellation_reason: reason ?? null,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * List cases with pagination, filtering, and sorting.
   *
   * @param client - Supabase server client
   * @param query  - Validated query parameters
   * @returns Paginated case list with meta
   * @throws Error if query fails
   */
  async listCases(
    client: Client,
    query: CaseListQuery,
  ): Promise<{
    data: CaseRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    let builder = client.from('cases').select('*', { count: 'exact' });

    if (query.status) {
      builder = builder.eq('status', query.status);
    }
    if (query.case_type) {
      builder = builder.eq('case_type', query.case_type);
    }

    const from = (query.page - 1) * query.per_page;
    const to = from + query.per_page - 1;

    const { data, error, count } = await builder
      .order(query.sort_by, { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    const total_pages = Math.ceil(total / query.per_page);

    return {
      data: data ?? [],
      meta: {
        page: query.page,
        per_page: query.per_page,
        total,
        total_pages,
      },
    };
  }
}
