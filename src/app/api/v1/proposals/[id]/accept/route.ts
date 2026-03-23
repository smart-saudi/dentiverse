import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProposalService } from '@/services/proposal.service';

const proposalService = new ProposalService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/proposals/[id]/accept — Accept a proposal.
 * Only the case owner can accept proposals on their cases.
 *
 * @param _req - Next.js request
 * @param context - Route context with proposal ID
 * @returns The accepted proposal
 */
export async function POST(_req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { id: proposalId } = await context.params;

  try {
    // Verify the authenticated user owns the case this proposal belongs to
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('case_id')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Proposal not found' },
        { status: 404 },
      );
    }

    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('client_id')
      .eq('id', proposal.case_id)
      .single();

    if (caseError || !caseRow) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Case not found' },
        { status: 404 },
      );
    }

    if (caseRow.client_id !== user.id) {
      return NextResponse.json(
        { code: 'FORBIDDEN', message: 'Only the case owner can accept proposals' },
        { status: 403 },
      );
    }

    const accepted = await proposalService.acceptProposal(supabase, proposalId);
    return NextResponse.json({ data: accepted });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to accept proposal',
      },
      { status: 500 },
    );
  }
}
