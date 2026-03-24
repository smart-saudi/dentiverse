import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/approve — Approve the latest design and trigger payment release.
 *
 * Only the case owner (client) can approve. Case must be in REVIEW status.
 * Transitions case to APPROVED and the latest design version to APPROVED.
 *
 * @param _req - Next.js request
 * @param context - Route context with case ID
 * @returns The updated case
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

  const { id: caseId } = await context.params;

  // Fetch the case
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
      { code: 'FORBIDDEN', message: 'Only the case owner can approve designs' },
      { status: 403 },
    );
  }

  if (caseRow.status !== 'REVIEW') {
    return NextResponse.json(
      { code: 'INVALID_STATUS', message: 'Case must be in REVIEW status to approve' },
      { status: 409 },
    );
  }

  try {
    // Approve the latest design version
    const { error: dvError } = await supabase
      .from('design_versions')
      .update({
        status: 'APPROVED',
        reviewed_at: new Date().toISOString(),
      })
      .eq('case_id', caseId)
      .eq('status', 'SUBMITTED')
      .order('version_number', { ascending: false })
      .limit(1);

    if (dvError) throw new Error(dvError.message);

    // Transition case to APPROVED
    const { data: updated, error: updateError } = await supabase
      .from('cases')
      .update({ status: 'APPROVED' })
      .eq('id', caseId)
      .select()
      .single();

    if (updateError || !updated)
      throw new Error(updateError?.message ?? 'Failed to approve case');

    return NextResponse.json({ data: updated });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to approve design',
      },
      { status: 500 },
    );
  }
}
