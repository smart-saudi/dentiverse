import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createReviewSchema } from '@/lib/validations/review';
import { ReviewService } from '@/services/review.service';

const reviewService = new ReviewService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/review — Submit a review for a completed case.
 *
 * The reviewer is the authenticated user. The designer is determined from
 * the accepted proposal on the case.
 *
 * @param req - Next.js request with review body
 * @param context - Route context with case ID
 * @returns The created review
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

  const { id: caseId } = await context.params;

  // Verify the case exists and belongs to the reviewer
  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select('client_id, status')
    .eq('id', caseId)
    .single();

  if (caseError || !caseRow) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Case not found' },
      { status: 404 },
    );
  }

  if (caseRow.client_id !== user.id) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'Only the case owner can submit a review' },
      { status: 403 },
    );
  }

  if (caseRow.status !== 'COMPLETED') {
    return NextResponse.json(
      {
        code: 'INVALID_STATUS',
        message: 'Reviews can only be submitted for completed cases',
      },
      { status: 409 },
    );
  }

  // Get the assigned designer from the accepted proposal
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('designer_id')
    .eq('case_id', caseId)
    .eq('status', 'ACCEPTED')
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'No accepted proposal found for this case' },
      { status: 404 },
    );
  }

  const body = await req.json();
  const parsed = createReviewSchema.safeParse(body);
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
    const review = await reviewService.createReview(
      supabase,
      caseId,
      user.id,
      proposal.designer_id,
      parsed.data,
    );
    return NextResponse.json({ data: review }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to create review',
      },
      { status: 500 },
    );
  }
}
