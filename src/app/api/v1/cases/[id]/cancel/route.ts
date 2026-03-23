import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const CANCELLABLE_STATUSES = new Set(['DRAFT', 'OPEN', 'ASSIGNED']);

/**
 * POST /api/v1/cases/[id]/cancel
 *
 * Cancel a case with an optional reason. Only the case owner can cancel,
 * and only from DRAFT, OPEN, or ASSIGNED status.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    // Verify ownership and current status
    const { data: existing, error: fetchError } = await supabase
      .from('cases')
      .select('client_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Case not found' },
        { status: 404 },
      );
    }

    if (existing.client_id !== user.id) {
      return NextResponse.json(
        { code: 'FORBIDDEN', message: 'You do not own this case' },
        { status: 403 },
      );
    }

    if (!CANCELLABLE_STATUSES.has(existing.status)) {
      return NextResponse.json(
        {
          code: 'INVALID_STATUS',
          message: `Cannot cancel a case in ${existing.status} status`,
        },
        { status: 409 },
      );
    }

    let reason: string | null = null;
    try {
      const body = await request.json();
      reason = body.reason ?? null;
    } catch {
      // No body is acceptable
    }

    const { data, error } = await supabase
      .from('cases')
      .update({
        status: 'CANCELLED',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('client_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { code: 'UPDATE_ERROR', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
