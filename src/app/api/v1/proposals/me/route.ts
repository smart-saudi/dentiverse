import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { proposalListQuerySchema } from '@/lib/validations/proposal';
import { ProposalService } from '@/services/proposal.service';

const proposalService = new ProposalService();

/**
 * GET /api/v1/proposals/me — List the current user's proposals.
 *
 * @param req - Next.js request with optional query params
 * @returns Paginated list of the user's proposals
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = proposalListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Invalid query', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await proposalService.listProposalsByDesigner(supabase, user.id, parsed.data);
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to list proposals' },
      { status: 500 },
    );
  }
}
