import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const requestRevisionSchema = z.object({
  feedback: z.string().min(20, 'Feedback must be at least 20 characters'),
});

/**
 * POST /api/v1/cases/[id]/request-revision — Request a revision on the latest design.
 *
 * Only the case owner (client) can request revisions. Case must be in REVIEW status.
 * Transitions case to REVISION and the latest design version to REVISION_REQUESTED.
 *
 * @param req - Next.js request with feedback body
 * @param context - Route context with case ID
 * @returns The updated case
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

  const body = await req.json();
  const parsed = requestRevisionSchema.safeParse(body);
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

  // Fetch the case
  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select('client_id, status, max_revisions, revision_count')
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
      { code: 'FORBIDDEN', message: 'Only the case owner can request revisions' },
      { status: 403 },
    );
  }

  if (caseRow.status !== 'REVIEW') {
    return NextResponse.json(
      {
        code: 'INVALID_STATUS',
        message: 'Case must be in REVIEW status to request revision',
      },
      { status: 409 },
    );
  }

  if (
    caseRow.max_revisions !== null &&
    caseRow.revision_count !== null &&
    caseRow.revision_count >= caseRow.max_revisions
  ) {
    return NextResponse.json(
      { code: 'REVISION_LIMIT', message: 'Maximum number of revisions reached' },
      { status: 409 },
    );
  }

  try {
    // Mark the latest submitted design version as REVISION_REQUESTED
    const { error: dvError } = await supabase
      .from('design_versions')
      .update({
        status: 'REVISION_REQUESTED',
        revision_feedback: parsed.data.feedback,
        reviewed_at: new Date().toISOString(),
      })
      .eq('case_id', caseId)
      .eq('status', 'SUBMITTED')
      .order('version_number', { ascending: false })
      .limit(1);

    if (dvError) throw new Error(dvError.message);

    // Transition case to REVISION and increment revision count
    const { data: updated, error: updateError } = await supabase
      .from('cases')
      .update({
        status: 'REVISION',
        revision_count: (caseRow.revision_count ?? 0) + 1,
      })
      .eq('id', caseId)
      .select()
      .single();

    if (updateError || !updated)
      throw new Error(updateError?.message ?? 'Failed to request revision');

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to request revision',
      },
      { status: 500 },
    );
  }
}
