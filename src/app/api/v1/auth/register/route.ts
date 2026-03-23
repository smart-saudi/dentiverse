import { NextRequest, NextResponse } from 'next/server';

import { registerSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/register
 *
 * Register a new user. Creates a Supabase Auth user and a row in public.users.
 * No authentication required.
 *
 * @param request - Incoming request with { email, password, full_name, role }
 * @returns 201 with user data or 400/409 on error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

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

    const { email, password, full_name, role } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role } },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { code: 'CONFLICT', message: 'Email already registered' },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { code: 'AUTH_ERROR', message: error.message },
        { status: 400 },
      );
    }

    const { data: userRow, error: insertError } = await supabase
      .from('users')
      .insert({ id: data.user!.id, email, full_name, role })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { code: 'INSERT_ERROR', message: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { data: { user: userRow, session: data.session } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
