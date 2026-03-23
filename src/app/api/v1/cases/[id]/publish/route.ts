import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/publish
 *
 * Publish a draft case (DRAFT → OPEN). Only the case owner can publish.
 */
export async function POST(_request: NextRequest, context: RouteContext) {
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

    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { code: 'INVALID_STATUS', message: 'Only DRAFT cases can be published' },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from('cases')
      .update({ status: 'OPEN' })
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
