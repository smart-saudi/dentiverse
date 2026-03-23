import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCaseSchema, caseListQuerySchema } from '@/lib/validations/case';

/**
 * POST /api/v1/cases
 *
 * Create a new dental case in DRAFT status.
 * Only authenticated DENTIST or LAB users can create cases.
 */
export async function POST(request: NextRequest) {
  try {
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
    const parsed = createCaseSchema.safeParse(body);

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

    const input = parsed.data;

    const { data, error } = await supabase
      .from('cases')
      .insert({
        client_id: user.id,
        status: 'DRAFT',
        case_type: input.case_type,
        title: input.title,
        description: input.description ?? null,
        tooth_numbers: input.tooth_numbers,
        material_preference: input.material_preference ?? null,
        shade: input.shade ?? null,
        budget_min: input.budget_min ?? null,
        budget_max: input.budget_max ?? null,
        deadline: input.deadline ?? null,
        urgency: input.urgency,
        special_instructions: input.special_instructions ?? null,
        software_required: input.software_required ?? null,
        output_format: input.output_format,
        max_revisions: input.max_revisions,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { code: 'INSERT_ERROR', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/cases
 *
 * List cases with pagination, filtering by status/type, and sorting.
 */
export async function GET(request: NextRequest) {
  try {
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

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const parsed = caseListQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { page, per_page, sort_by, status, case_type } = parsed.data;

    let builder = supabase.from('cases').select('*', { count: 'exact' });

    if (status) builder = builder.eq('status', status);
    if (case_type) builder = builder.eq('case_type', case_type);

    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    const { data, error, count } = await builder
      .order(sort_by, { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { code: 'QUERY_ERROR', message: error.message },
        { status: 500 },
      );
    }

    const total = count ?? 0;

    return NextResponse.json(
      {
        data: data ?? [],
        meta: {
          page,
          per_page,
          total,
          total_pages: Math.ceil(total / per_page),
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
