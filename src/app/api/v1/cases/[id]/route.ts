import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateCaseSchema } from '@/lib/validations/case';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/cases/[id]
 *
 * Get a single case by ID.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
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
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Case not found' },
        { status: 404 },
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

/**
 * PATCH /api/v1/cases/[id]
 *
 * Update a case (only DRAFT or OPEN status).
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const body = await request.json();
    const parsed = updateCaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('cases')
      .update(parsed.data)
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
