import { NextRequest, NextResponse } from 'next/server';

import { resetPasswordSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/reset-password
 *
 * Reset user password using a token from the reset email.
 * The Supabase client must have an active session from the token exchange.
 * No authentication required (token-based).
 *
 * @param request - Incoming request with { token, password }
 * @returns 200 on success
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

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

    const { password } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json(
        { code: 'RESET_ERROR', message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { data: { message: 'Password updated successfully' } },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
