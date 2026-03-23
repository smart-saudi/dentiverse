import { NextRequest, NextResponse } from 'next/server';

import { loginSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/login
 *
 * Authenticate with email and password.
 * No authentication required.
 *
 * @param request - Incoming request with { email, password }
 * @returns 200 with user, access_token, refresh_token, expires_at
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

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

    const { email, password } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid login credentials' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        data: {
          user: data.user,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
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
