import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProposalService } from '@/services/proposal.service';

const proposalService = new ProposalService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/proposals/[id]/accept — Accept a proposal.
 *
 * @param _req - Next.js request
 * @param context - Route context with proposal ID
 * @returns The accepted proposal
 */
export async function POST(_req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const { id: proposalId } = await context.params;

  try {
    const proposal = await proposalService.acceptProposal(supabase, proposalId);
    return NextResponse.json({ data: proposal });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to accept proposal' },
      { status: 500 },
    );
  }
}
