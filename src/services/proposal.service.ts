import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/types';
import type { CreateProposalInput, ProposalListQuery } from '@/lib/validations/proposal';
import { NotFoundError } from '@/lib/errors';

type Client = AppSupabaseClient;
type ProposalRow = Database['public']['Tables']['proposals']['Row'];

/**
 * Service for proposal operations (create, list, accept, reject, withdraw).
 */
export class ProposalService {
  /**
   * Create a proposal on a case.
   *
   * @param client - Supabase client
   * @param caseId - The case to propose on
   * @param designerId - The designer creating the proposal
   * @param input - Proposal details
   * @returns The created proposal
   */
  async createProposal(
    client: Client,
    caseId: string,
    designerId: string,
    input: CreateProposalInput,
  ): Promise<ProposalRow> {
    const { data, error } = await client
      .from('proposals')
      .insert({
        case_id: caseId,
        designer_id: designerId,
        price: input.price,
        estimated_hours: input.estimated_hours,
        message: input.message,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create proposal');
    return data;
  }

  /**
   * Fetch a single proposal by ID.
   *
   * @param client - Supabase client
   * @param proposalId - Proposal ID
   * @returns The proposal row
   * @throws NotFoundError if not found
   */
  async getProposal(client: Client, proposalId: string): Promise<ProposalRow> {
    const { data, error } = await client
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (error || !data) throw new NotFoundError('Proposal not found');
    return data;
  }

  /**
   * List proposals for a specific case with pagination.
   *
   * @param client - Supabase client
   * @param caseId - Case ID
   * @param query - Pagination params
   * @returns Paginated proposal list
   */
  async listProposalsForCase(
    client: Client,
    caseId: string,
    query: ProposalListQuery,
  ): Promise<{
    data: ProposalRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    const offset = (query.page - 1) * query.per_page;

    let q = client
      .from('proposals')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId);

    if (query.status) {
      q = q.eq('status', query.status);
    }

    const { data, error, count } = await q
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
   * List proposals by a specific designer with pagination.
   *
   * @param client - Supabase client
   * @param designerId - Designer's user ID
   * @param query - Pagination params
   * @returns Paginated proposal list
   */
  async listProposalsByDesigner(
    client: Client,
    designerId: string,
    query: ProposalListQuery,
  ): Promise<{
    data: ProposalRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    const offset = (query.page - 1) * query.per_page;

    let q = client
      .from('proposals')
      .select('*', { count: 'exact' })
      .eq('designer_id', designerId);

    if (query.status) {
      q = q.eq('status', query.status);
    }

    const { data, error, count } = await q
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
   * Accept a proposal (sets status to ACCEPTED).
   *
   * @param client - Supabase client
   * @param proposalId - Proposal ID
   * @returns The updated proposal
   */
  async acceptProposal(client: Client, proposalId: string): Promise<ProposalRow> {
    const { data, error } = await client
      .from('proposals')
      .update({
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to accept proposal');
    return data;
  }

  /**
   * Reject a proposal (sets status to REJECTED).
   *
   * @param client - Supabase client
   * @param proposalId - Proposal ID
   * @returns The updated proposal
   */
  async rejectProposal(client: Client, proposalId: string): Promise<ProposalRow> {
    const { data, error } = await client
      .from('proposals')
      .update({
        status: 'REJECTED',
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to reject proposal');
    return data;
  }

  /**
   * Withdraw a proposal (designer cancels their own proposal).
   *
   * @param client - Supabase client
   * @param proposalId - Proposal ID
   * @returns The updated proposal
   */
  async withdrawProposal(client: Client, proposalId: string): Promise<ProposalRow> {
    const { data, error } = await client
      .from('proposals')
      .update({
        status: 'WITHDRAWN',
        updated_at: new Date().toISOString(),
      })
      .eq('id', proposalId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to withdraw proposal');
    return data;
  }
}
