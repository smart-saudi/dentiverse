import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createProposalSchema,
  proposalListQuerySchema,
} from '@/lib/validations/proposal';
import { EmailService } from '@/services/email.service';
import { ProposalService } from '@/services/proposal.service';

const proposalService = new ProposalService();
const emailService = new EmailService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/proposals — Submit a proposal on a case.
 *
 * @param req - Next.js request with proposal body
 * @param context - Route context with case ID
 * @returns The created proposal
 */
export async function POST(req: NextRequest, context: RouteContext) {
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

  // Only DESIGNER users can submit proposals
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'DESIGNER') {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'Only designers can submit proposals' },
      { status: 403 },
    );
  }

  const { id: caseId } = await context.params;
  const body = await req.json();
  const parsed = createProposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const proposal = await proposalService.createProposal(
      supabase,
      caseId,
      user.id,
      parsed.data,
    );
    await emailService.sendProposalReceivedEmail({
      caseId,
      proposalId: proposal.id,
      designerId: user.id,
      estimatedHours: proposal.estimated_hours,
      price: proposal.price,
    });
    return NextResponse.json({ data: proposal }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to create proposal',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/cases/[id]/proposals — List proposals for a case.
 *
 * @param req - Next.js request with optional query params
 * @param context - Route context with case ID
 * @returns Paginated list of proposals
 */
export async function GET(req: NextRequest, context: RouteContext) {
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

  const { id: caseId } = await context.params;
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = proposalListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const result = await proposalService.listProposalsForCase(
      supabase,
      caseId,
      parsed.data,
    );
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to list proposals',
      },
      { status: 500 },
    );
  }
}
