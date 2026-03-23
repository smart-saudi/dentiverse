import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/publish
 *
 * Publish a draft case (DRAFT → OPEN).
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

    const { data, error } = await supabase
      .from('cases')
      .update({ status: 'OPEN' })
      .eq('id', id)
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
